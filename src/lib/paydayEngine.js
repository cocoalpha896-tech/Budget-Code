// Pure functions — no server/cron involved. The check runs client-side every
// time the app is opened: "has today passed the current period's end date?"

export function getPeriodForDate(date, dayOfMonth) {
  const d = new Date(date);
  let end = new Date(d.getFullYear(), d.getMonth(), dayOfMonth, 0, 0, 0);
  if (end <= d) {
    end = new Date(d.getFullYear(), d.getMonth() + 1, dayOfMonth, 0, 0, 0);
  }
  const start = new Date(end.getFullYear(), end.getMonth() - 1, dayOfMonth, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function computeCCLiquidity(data) {
  const uob = data.accounts.banks.find((b) => b.id === 'uob_savings');
  const uobBalance = uob ? uob.balance : 0;
  const ccTotal = data.accounts.creditCards.reduce((sum, c) => sum + (c.unpaidBalance || 0), 0);
  return uobBalance - ccTotal;
}

function formatPeriodLabel(startIso, endIso) {
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  const start = new Date(startIso).toLocaleDateString('en-MY', opts);
  const end = new Date(endIso).toLocaleDateString('en-MY', opts);
  return `${start} – ${end}`;
}

// Mutates and returns a plain updated copy of `data`. Loops in case the app
// was closed across more than one payday (rare, but handled correctly).
export function rollPeriodIfNeeded(data) {
  const today = new Date();
  const next = structuredClone(data);
  let changed = false;

  if (!next.currentPeriod?.start || !next.currentPeriod?.end) {
    next.currentPeriod = { ...getPeriodForDate(today, next.payday.dayOfMonth), transactions: [] };
    return { data: next, changed: true };
  }
  if (!next.currentPeriod.transactions) {
    next.currentPeriod.transactions = []; // migrate older saved files that predate this field
  }

  while (new Date(next.currentPeriod.end) <= today) {
    const totalSpent = next.categories.reduce((sum, c) => sum + c.spent, 0);

    next.history.unshift({
      period: formatPeriodLabel(next.currentPeriod.start, next.currentPeriod.end),
      start: next.currentPeriod.start,
      end: next.currentPeriod.end,
      categories: next.categories.map((c) => ({ ...c })),
      transactions: (next.currentPeriod.transactions || []).map((t) => ({ ...t })),
      ccLiquidity: computeCCLiquidity(next),
      totalSpent,
    });

    // Salary lands in one account only
    const target = next.accounts.banks.find((a) => a.id === next.payday.targetAccountId);
    if (target) target.balance += Number(next.payday.salaryAmount) || 0;

    // Reset category spend, keep the edited budget caps
    next.categories = next.categories.map((c) => ({ ...c, spent: 0 }));

    // Advance to the following period
    const dayAfterOldEnd = new Date(new Date(next.currentPeriod.end).getTime() + 86400000);
    const newBounds = getPeriodForDate(dayAfterOldEnd, next.payday.dayOfMonth);
    next.currentPeriod = { start: next.currentPeriod.end, end: newBounds.end, transactions: [] };

    changed = true;
  }

  return { data: next, changed };
}

export function daysUntil(dateIso) {
  const ms = new Date(dateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
