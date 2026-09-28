// Pure functions — no server/cron involved.

export function getPeriodForDate(date, dayOfMonth) {
  const dom = Number(dayOfMonth) || 27;
  const d = new Date(date);
  let end = new Date(d.getFullYear(), d.getMonth(), dom, 0, 0, 0);
  if (end <= d) {
    end = new Date(d.getFullYear(), d.getMonth() + 1, dom, 0, 0, 0);
  }
  const start = new Date(end.getFullYear(), end.getMonth() - 1, dom, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function computeCCLiquidity(data) {
  if (!data?.accounts) return 0;
  const bankTotal = data.accounts.banks?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0;
  const ccTotal = data.accounts.creditCards?.reduce((sum, c) => sum + (c.unpaidBalance ?? c.balance ?? 0), 0) || 0;
  return bankTotal - ccTotal;
}

function formatPeriodLabel(startIso, endIso) {
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  const start = new Date(startIso).toLocaleDateString('en-MY', opts);
  const end = new Date(endIso).toLocaleDateString('en-MY', opts);
  return `${start} – ${end}`;
}

export function rollPeriodIfNeeded(data) {
  if (!data) return { data, changed: false };
  const today = new Date();
  const next = structuredClone(data);
  let changed = false;

  if (!next.payday) {
    next.payday = { dayOfMonth: 27, salaryAmount: 3700, targetAccountId: 'maybank_savings' };
    changed = true;
  }
  const dayOfMonth = Number(next.payday.dayOfMonth) || 27;

  if (!next.currentPeriod?.start || !next.currentPeriod?.end) {
    next.currentPeriod = { ...getPeriodForDate(today, dayOfMonth), transactions: [] };
    return { data: next, changed: true };
  }
  if (!next.currentPeriod.transactions) {
    next.currentPeriod.transactions = [];
  }

  while (new Date(next.currentPeriod.end) <= today) {
    const totalSpent = next.categories.reduce((sum, c) => sum + (c.spent || 0), 0);

    if (!next.history) next.history = [];

    next.history.unshift({
      period: formatPeriodLabel(next.currentPeriod.start, next.currentPeriod.end),
      start: next.currentPeriod.start,
      end: next.currentPeriod.end,
      categories: next.categories.map((c) => ({ ...c })),
      transactions: (next.currentPeriod.transactions || []).map((t) => ({ ...t })),
      ccLiquidity: computeCCLiquidity(next),
      totalSpent,
    });

    const target = next.accounts?.banks?.find((a) => a.id === (next.payday.targetAccountId || 'maybank_savings'));
    if (target) {
      target.balance = (target.balance || 0) + (Number(next.payday.salaryAmount) || 0);
    }

    next.categories = next.categories.map((c) => ({ ...c, spent: 0 }));

    const dayAfterOldEnd = new Date(new Date(next.currentPeriod.end).getTime() + 86400000);
    const newBounds = getPeriodForDate(dayAfterOldEnd, dayOfMonth);
    next.currentPeriod = { start: next.currentPeriod.end, end: newBounds.end, transactions: [] };

    changed = true;
  }

  return { data: next, changed };
}

export function forceRollPeriod(data) {
  if (!data) return data;
  const today = new Date();
  const next = structuredClone(data);

  if (!next.payday) {
    next.payday = { dayOfMonth: 27, salaryAmount: 3700, targetAccountId: 'maybank_savings' };
  }
  const dayOfMonth = Number(next.payday.dayOfMonth) || 27;

  const totalSpent = next.categories.reduce((sum, c) => sum + (c.spent || 0), 0);
  if (!next.history) next.history = [];

  const startIso = next.currentPeriod?.start || new Date(today.getFullYear(), today.getMonth() - 1, dayOfMonth).toISOString();
  const endIso = today.toISOString();

  next.history.unshift({
    period: formatPeriodLabel(startIso, endIso),
    start: startIso,
    end: endIso,
    categories: next.categories.map((c) => ({ ...c })),
    transactions: (next.currentPeriod?.transactions || []).map((t) => ({ ...t })),
    ccLiquidity: computeCCLiquidity(next),
    totalSpent,
  });

  const target = next.accounts?.banks?.find((a) => a.id === (next.payday.targetAccountId || 'maybank_savings'));
  if (target) {
    target.balance = (target.balance || 0) + (Number(next.payday.salaryAmount) || 0);
  }

  next.categories = next.categories.map((c) => ({ ...c, spent: 0 }));

  const newBounds = getPeriodForDate(new Date(today.getTime() + 86400000), dayOfMonth);
  next.currentPeriod = { start: today.toISOString(), end: newBounds.end, transactions: [] };

  return next;
}

export function daysUntil(dateIso) {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// Transfer funds between savings/investment accounts
export function transferFunds(data, { fromAccountId, toAccountId, amount, note }) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return data;

  const next = structuredClone(data);

  const sourceCat = Object.keys(next.accounts).find((cat) =>
    next.accounts[cat].some((acc) => acc.id === fromAccountId)
  );
  if (sourceCat) {
    next.accounts[sourceCat] = next.accounts[sourceCat].map((acc) =>
      acc.id === fromAccountId ? { ...acc, balance: (acc.balance || 0) - numAmount } : acc
    );
  }

  const destCat = Object.keys(next.accounts).find((cat) =>
    next.accounts[cat].some((acc) => acc.id === toAccountId)
  );
  if (destCat) {
    next.accounts[destCat] = next.accounts[destCat].map((acc) =>
      acc.id === toAccountId ? { ...acc, balance: (acc.balance || 0) + numAmount } : acc
    );
  }

  const newTransaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: 'transfer',
    fromAccountId,
    toAccountId,
    amount: numAmount,
    note: note || 'Savings Allocation / Transfer',
  };

  next.transactions = [newTransaction, ...(next.transactions || [])];
  return next;
}

// Pay credit card balance from a liquid bank account
export function payCreditCard(data, { creditCardId, paidFromAccountId, amount, note }) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return data;

  const next = structuredClone(data);

  const bankCat = Object.keys(next.accounts).find((cat) =>
    next.accounts[cat].some((acc) => acc.id === paidFromAccountId)
  );
  if (bankCat) {
    next.accounts[bankCat] = next.accounts[bankCat].map((acc) =>
      acc.id === paidFromAccountId ? { ...acc, balance: (acc.balance || 0) - numAmount } : acc
    );
  }

  if (next.accounts.creditCards) {
    next.accounts.creditCards = next.accounts.creditCards.map((card) => {
      if (card.id === creditCardId) {
        const currentBal = card.unpaidBalance ?? card.balance ?? 0;
        const newBal = Math.max(0, currentBal - numAmount);
        return { ...card, balance: newBal, unpaidBalance: newBal };
      }
      return card;
    });
  }

  const newTransaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: 'cc_payment',
    creditCardId,
    paidFromAccountId,
    amount: numAmount,
    note: note || 'Credit Card Payment',
  };

  next.transactions = [newTransaction, ...(next.transactions || [])];
  return next;
}

// Record incoming money into any account
export function depositIncome(data, { accountId, amount, note }) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return data;

  const next = structuredClone(data);

  const cat = Object.keys(next.accounts).find((key) =>
    next.accounts[key].some((acc) => acc.id === accountId)
  );

  if (cat) {
    next.accounts[cat] = next.accounts[cat].map((acc) =>
      acc.id === accountId ? { ...acc, balance: (acc.balance || 0) + numAmount } : acc
    );
  }

  const newTransaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: 'income',
    accountId,
    amount: numAmount,
    note: note || 'Incoming Money / Deposit',
  };

  next.transactions = [newTransaction, ...(next.transactions || [])];
  return next;
}

// Helper: Reverses a transaction's effect on accounts and category totals
function reverseTransactionEffect(data, tx) {
  const next = structuredClone(data);
  const amount = Number(tx.amount) || 0;

  // 1. Standard spend
  if (tx.categoryId || tx.type === 'spend') {
    if (tx.categoryId) {
      next.categories = next.categories.map((c) =>
        c.id === tx.categoryId ? { ...c, spent: Math.max(0, (c.spent || 0) - amount) } : c
      );
    }
    if (tx.accountId) {
      Object.keys(next.accounts).forEach((catKey) => {
        next.accounts[catKey] = next.accounts[catKey].map((acc) => {
          if (acc.id === tx.accountId) {
            if (catKey === 'creditCards') {
              const newBal = Math.max(0, (acc.unpaidBalance ?? acc.balance ?? 0) - amount);
              return { ...acc, balance: newBal, unpaidBalance: newBal };
            } else {
              return { ...acc, balance: (acc.balance || 0) + amount };
            }
          }
          return acc;
        });
      });
    }
  }
  // 2. Transfer
  else if (tx.type === 'transfer') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === tx.fromAccountId) return { ...acc, balance: (acc.balance || 0) + amount };
        if (acc.id === tx.toAccountId) return { ...acc, balance: (acc.balance || 0) - amount };
        return acc;
      });
    });
  }
  // 3. Credit Card Payment
  else if (tx.type === 'cc_payment') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === tx.paidFromAccountId) return { ...acc, balance: (acc.balance || 0) + amount };
        if (acc.id === tx.creditCardId) {
          const newBal = (acc.unpaidBalance ?? acc.balance ?? 0) + amount;
          return { ...acc, balance: newBal, unpaidBalance: newBal };
        }
        return acc;
      });
    });
  }
  // 4. Income
  else if (tx.type === 'income') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === tx.accountId) return { ...acc, balance: (acc.balance || 0) - amount };
        return acc;
      });
    });
  }

  return next;
}

// Delete a transaction completely
export function deleteTransaction(data, txId) {
  if (!data || !txId) return data;

  const tx =
    (data.transactions || []).find((t) => t.id === txId) ||
    (data.currentPeriod?.transactions || []).find((t) => t.id === txId);

  if (!tx) return data;

  let next = reverseTransactionEffect(data, tx);

  if (next.transactions) {
    next.transactions = next.transactions.filter((t) => t.id !== txId);
  }
  if (next.currentPeriod?.transactions) {
    next.currentPeriod.transactions = next.currentPeriod.transactions.filter((t) => t.id !== txId);
  }

  return next;
}

// Edit a transaction's amount, note, or account
export function editTransaction(data, txId, updatedFields) {
  if (!data || !txId) return data;

  const tx =
    (data.transactions || []).find((t) => t.id === txId) ||
    (data.currentPeriod?.transactions || []).find((t) => t.id === txId);

  if (!tx) return data;

  // 1. Reverse old transaction effect
  let next = reverseTransactionEffect(data, tx);

  // 2. Build updated transaction
  const updatedTx = {
    ...tx,
    ...updatedFields,
    amount: parseFloat(updatedFields.amount) || 0,
  };

  const amount = updatedTx.amount;

  // 3. Apply new effect
  if (updatedTx.categoryId || updatedTx.type === 'spend') {
    if (updatedTx.categoryId) {
      next.categories = next.categories.map((c) =>
        c.id === updatedTx.categoryId ? { ...c, spent: (c.spent || 0) + amount } : c
      );
    }
    if (updatedTx.accountId) {
      Object.keys(next.accounts).forEach((catKey) => {
        next.accounts[catKey] = next.accounts[catKey].map((acc) => {
          if (acc.id === updatedTx.accountId) {
            if (catKey === 'creditCards') {
              const newBal = (acc.unpaidBalance ?? acc.balance ?? 0) + amount;
              return { ...acc, balance: newBal, unpaidBalance: newBal };
            } else {
              return { ...acc, balance: (acc.balance || 0) - amount };
            }
          }
          return acc;
        });
      });
    }
  } else if (updatedTx.type === 'transfer') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === updatedTx.fromAccountId) return { ...acc, balance: (acc.balance || 0) - amount };
        if (acc.id === updatedTx.toAccountId) return { ...acc, balance: (acc.balance || 0) + amount };
        return acc;
      });
    });
  } else if (updatedTx.type === 'cc_payment') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === updatedTx.paidFromAccountId) return { ...acc, balance: (acc.balance || 0) - amount };
        if (acc.id === updatedTx.creditCardId) {
          const newBal = Math.max(0, (acc.unpaidBalance ?? acc.balance ?? 0) - amount);
          return { ...acc, balance: newBal, unpaidBalance: newBal };
        }
        return acc;
      });
    });
  } else if (updatedTx.type === 'income') {
    Object.keys(next.accounts).forEach((catKey) => {
      next.accounts[catKey] = next.accounts[catKey].map((acc) => {
        if (acc.id === updatedTx.accountId) return { ...acc, balance: (acc.balance || 0) + amount };
        return acc;
      });
    });
  }

  // 4. Update transaction arrays
  const updateArr = (arr) => (arr || []).map((t) => (t.id === txId ? updatedTx : t));
  if (next.transactions) next.transactions = updateArr(next.transactions);
  if (next.currentPeriod?.transactions) next.currentPeriod.transactions = updateArr(next.currentPeriod.transactions);

  return next;
}
