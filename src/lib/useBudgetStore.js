import { useCallback, useEffect, useRef, useState } from 'react';
import { initAuth, requestToken, getValidStoredToken, signOut as gSignOut } from './googleAuth';
import { findBudgetFile, createBudgetFile, readBudgetFile, updateBudgetFile } from './driveApi';
import { makeDefaultData, migrateData } from './defaultData';
import { rollPeriodIfNeeded, transferFunds, payCreditCard, depositIncome } from './paydayEngine';

const SAVE_DEBOUNCE_MS = 1500;
const LOCAL_CACHE_KEY = 'budget_pwa_cached_data';

export function useBudgetStore() {
  const [status, setStatus] = useState('init'); // init | signed-out | loading | ready | error
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | saving | saved | offline

  const fileIdRef = useRef(null);
  const tokenRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Backup to localStorage immediately whenever data updates
  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to cache data locally', e);
      }
    }
  }, [data]);

  const getToken = useCallback(async () => {
    const stored = getValidStoredToken();
    if (stored) return stored;
    try {
      return await requestToken({ silent: true });
    } catch {
      // iOS Safari ITP can block silent renewal — fall back to a visible prompt.
      return requestToken({ silent: false });
    }
  }, []);

  const loadFromDrive = useCallback(async () => {
    setStatus('loading');
    try {
      const token = await getToken();
      tokenRef.current = token;

      let file = await findBudgetFile(token);
      let loaded;
      if (!file) {
        const fresh = makeDefaultData();
        const created = await createBudgetFile(token, fresh);
        fileIdRef.current = created.id;
        loaded = fresh;
      } else {
        fileIdRef.current = file.id;
        const raw = await readBudgetFile(token, file.id);
        loaded = migrateData(raw);
      }

      const { data: rolled, changed } = rollPeriodIfNeeded(loaded);
      
      // Priority: use rolled Drive data
      setData(rolled);
      setStatus('ready');
      if (changed) {
        await updateBudgetFile(token, fileIdRef.current, rolled);
      }
    } catch (e) {
      // Fallback to local device cache if Google Drive fetch fails
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setStatus('ready');
          setSyncState('offline');
          return;
        } catch {}
      }
      setError(e);
      setStatus('error');
    }
  }, [getToken]);

  const signIn = useCallback(async () => {
    await initAuth();
    await requestToken({ silent: false });
    await loadFromDrive();
  }, [loadFromDrive]);

  const signOut = useCallback(() => {
    gSignOut();
    setData(null);
    fileIdRef.current = null;
    localStorage.removeItem(LOCAL_CACHE_KEY);
    setStatus('signed-out');
  }, []);

  // Try silent resume on load (returning visitor)
  useEffect(() => {
    (async () => {
      await initAuth();
      const stored = getValidStoredToken();
      if (stored) {
        await loadFromDrive();
      } else {
        // Load local cache first if offline/unauthenticated
        const cached = localStorage.getItem(LOCAL_CACHE_KEY);
        if (cached) {
          try {
            setData(JSON.parse(cached));
            setStatus('ready');
            return;
          } catch {}
        }
        setStatus('signed-out');
      }
    })();
  }, [loadFromDrive]);

  // Debounced autosave to Google Drive
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;

      clearTimeout(saveTimerRef.current);
      setSyncState('saving');

      saveTimerRef.current = setTimeout(async () => {
        try {
          const token = await getToken();
          tokenRef.current = token;
          if (fileIdRef.current && token && nextVal) {
            await updateBudgetFile(token, fileIdRef.current, nextVal);
            setSyncState('saved');
          } else {
            setSyncState('offline');
          }
        } catch (err) {
          console.error('Google Drive sync delayed, saved locally:', err);
          setSyncState('offline');
        }
      }, SAVE_DEBOUNCE_MS);

      return nextVal;
    });
  }, [getToken]);

  const executeTransfer = useCallback((params) => {
    updateData((prev) => transferFunds(prev, params));
  }, [updateData]);

  const executeCardPayment = useCallback((params) => {
    updateData((prev) => payCreditCard(prev, params));
  }, [updateData]);

  const executeIncome = useCallback((params) => {
    updateData((prev) => depositIncome(prev, params));
  }, [updateData]);

  return {
    status,
    error,
    data,
    updateData,
    signIn,
    signOut,
    syncState,
    executeTransfer,
    executeCardPayment,
    executeIncome
  };
}