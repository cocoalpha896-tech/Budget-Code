import { useState } from 'react';
import QuickEntrySheet from './QuickEntrySheet';

function formatMYR(n) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const ALL_TARGET_NAMES = {
  bank: 'banks',
  investment: 'investments',
};

export default function BudgetsView({ data, updateData }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingDistribution, setEditingDistribution] = useState(null);

  const setBudgetCap = (amount) => {
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === editingCategory.id ? { ...c, budget: amount } : c
      ),
    }));
  };

  const setDistributionAmount = (amount) => {
    updateData((prev) => ({
      ...prev,
      payday: {
        ...prev.payday,
        distribution: prev.payday.distribution.map((d) =>
          d.targetId === editingDistribution.targetId ? { ...d, amount } : d
        ),
      },
    }));
  };

  const nameForTarget = (targetType, targetId) => {
    const list = data.accounts[ALL_TARGET_NAMES[targetType]];
    return list.find((a) => a.id === targetId)?.name || targetId;
  };

  const totalDistribution = data.payday.distribution.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );

  return (
    <div className="pb-24">
      <div className="px-5 pt-6 pb-2 text-lg font-semibold text-ink-text">Category budgets</div>
      <p className="px-5 pb-3 text-xs text-ink-muted">
        Editable anytime. These reset to full only when the payday counter rolls over.
      </p>

      {data.categories.map((c) => (
        <button
          key={c.id}
          onClick={() => setEditingCategory(c)}
          className="flex w-full items-center justify-between border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
        >
          <span className="text-sm text-ink-text">{c.name}</span>
          <span className="text-sm tabular-nums text-ink-muted">{formatMYR(c.budget)}</span>
        </button>
      ))}

      <div className="px-5 pt-8 pb-2 text-lg font-semibold text-ink-text">
        Payday distribution
      </div>
      <p className="px-5 pb-3 text-xs text-ink-muted">
        Fixed amount moved into each account/investment on the {data.payday.dayOfMonth}
        {ordinalSuffix(data.payday.dayOfMonth)} of every month.
      </p>

      {data.payday.distribution.map((d) => (
        <button
          key={d.targetId}
          onClick={() => setEditingDistribution(d)}
          className="flex w-full items-center justify-between border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
        >
          <span className="text-sm text-ink-text">{nameForTarget(d.targetType, d.targetId)}</span>
          <span className="text-sm tabular-nums text-ink-muted">{formatMYR(d.amount)}</span>
        </button>
      ))}

      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-sm text-ink-muted">Total distributed per payday</span>
        <span className="text-sm font-medium tabular-nums text-ink-text">
          {formatMYR(totalDistribution)}
        </span>
      </div>

      <QuickEntrySheet
        open={!!editingCategory}
        title={`Set monthly cap — ${editingCategory?.name || ''}`}
        confirmLabel="Save cap"
        onConfirm={setBudgetCap}
        onClose={() => setEditingCategory(null)}
      />

      <QuickEntrySheet
        open={!!editingDistribution}
        title={`Set fixed amount — ${
          editingDistribution ? nameForTarget(editingDistribution.targetType, editingDistribution.targetId) : ''
        }`}
        confirmLabel="Save amount"
        onConfirm={setDistributionAmount}
        onClose={() => setEditingDistribution(null)}
      />
    </div>
  );
}

function ordinalSuffix(n) {
  if (n === 1 || n === 21 || n === 31) return 'st';
  if (n === 2 || n === 22) return 'nd';
  if (n === 3 || n === 23) return 'rd';
  return 'th';
}
