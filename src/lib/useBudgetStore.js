import { useCallback, useEffect, useRef, useState } from 'react';
import { initAuth, requestToken, getValidStoredToken, signOut as gSignOut } from './googleAuth';
import { findBudgetFile, createBudgetFile, readBudgetFile, updateBudgetFile } from './driveApi';
import { makeDefaultData, migrateData } from './defaultData';
import { rollPeriodIfNeeded, transferFunds, payCreditCard, depositIncome } from './paydayEngine';

const SAVE_DEBOUNCE_MS = 1500;

export function useBudgetStore() {
  const [status, setStatus] = useState('init'); // init | signed-out | loading | ready | error
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | saving | saved | offline

  const fileIdRef = useRef(null);
  const tokenRef = useRef(null);
  const saveTimerRef = useRef(null);

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
      setData(rolled);
      setStatus('ready');
      if (changed) {
        // persist the rollover immediately so history/reset isn't lost
        await updateBudgetFile(token, fileIdRef.current, rolled);
      }
    } catch (e) {
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
        setStatus('signed-out');
      }
    })();
  }, [loadFromDrive]);

  // Debounced autosave whenever `data` changes
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;

      clearTimeout(saveTimerRef.current);
      setSyncState('saving');
      saveTimerRef.current = setTimeout(async () => {
        try {
          const token = tokenRef.current || (await getToken());
          tokenRef.current = token;
          if (fileIdRef.current) {
            await updateBudgetFile(token, fileIdRef.current, nextVal);
          }
          setSyncState('saved');
        } catch {
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