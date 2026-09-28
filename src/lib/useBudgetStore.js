import { useCallback, useEffect, useRef, useState } from 'react';
import { initAuth, requestToken, getValidStoredToken, signOut as gSignOut } from './googleAuth';
import { findBudgetFile, createBudgetFile, readBudgetFile, updateBudgetFile } from './driveApi';
import { makeDefaultData, migrateData } from './defaultData';
import {
  rollPeriodIfNeeded,
  forceRollPeriod,
  transferFunds,
  payCreditCard,
  depositIncome,
  adjustAccountBalance,
  deleteTransaction,
  editTransaction
} from './paydayEngine';

const SAVE_DEBOUNCE_MS = 1500;
const LOCAL_CACHE_KEY = 'budget_pwa_cached_data';

export function useBudgetStore() {
  const [status, setStatus] = useState('init');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [syncState, setSyncState] = useState('idle');

  const fileIdRef = useRef(null);
  const tokenRef = useRef(null);
  const saveTimerRef = useRef(null);

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
        await updateBudgetFile(token, fileIdRef.current, rolled);
      }
    } catch (e) {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        try {
          const migratedCached = migrateData(JSON.parse(cached));
          setData(migratedCached);
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

  useEffect(() => {
    (async () => {
      await initAuth();
      const stored = getValidStoredToken();
      if (stored) {
        await loadFromDrive();
      } else {
        const cached = localStorage.getItem(LOCAL_CACHE_KEY);
        if (cached) {
          try {
            const migratedCached = migrateData(JSON.parse(cached));
            setData(migratedCached);
            setStatus('ready');
            return;
          } catch {}
        }
        setStatus('signed-out');
      }
    })();
  }, [loadFromDrive]);

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

  const setAccountBalance = useCallback((accountId, newBalance) => {
    updateData((prev) => adjustAccountBalance(prev, { accountId, newBalance }));
  }, [updateData]);

  const forcePaydayReset = useCallback(() => {
    updateData((prev) => forceRollPeriod(prev));
  }, [updateData]);

  const removeTransaction = useCallback((txId) => {
    updateData((prev) => deleteTransaction(prev, txId));
  }, [updateData]);

  const modifyTransaction = useCallback((txId, updatedFields) => {
    updateData((prev) => editTransaction(prev, txId, updatedFields));
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
    executeIncome,
    setAccountBalance,
    forcePaydayReset,
    removeTransaction,
    modifyTransaction
  };
}
