import { useState } from 'react';
import QuickEntrySheet from './QuickEntrySheet';
import { metaFor } from '../lib/categoryMeta';

function formatMYR(n) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function BudgetsView({ data, updateData }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSalary, setEditingSalary] = useState(false);

  const setBudgetCap = (amount) => {
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === editingCategory.id ? { ...c, budget: amount } : c
      ),
    }));
  };

  const setSalaryAmount = (amount) => {
    updateData((prev) => ({
      ...prev,
      payday: { ...prev.payday, salaryAmount: amount },
    }));
  };

  const targetAccountName =
    data.accounts.banks.find((b) => b.id === data.payday.targetAccountId)?.name || 'Maybank Savings';

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-indigo-500/15 via-transparent to-transparent px-5 pt-6 pb-2 text-lg font-semibold text-ink-text">
        Category budgets
      </div>
      <p className="px-5 pb-3 text-xs text-ink-muted">
        Fixed per month — these only reset back to full spend-tracking when the payday
        counter rolls over. Tap any category to change its cap.
      </p>

      {data.categories.map((c) => {
        const { icon: Icon, color } = metaFor(c.id);
        return (
          <button
            key={c.id}
            onClick={() => setEditingCategory(c)}
            className="flex w-full items-center justify-between border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
            style={{ borderLeft: `3px solid ${color}` }}
          >
            <span className="flex items-center gap-2 text-sm text-ink-text">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}26` }}
              >
                <Icon size={14} color={color} strokeWidth={2.25} />
              </span>
              {c.name}
            </span>
            <span className="text-sm tabular-nums text-ink-muted">{formatMYR(c.budget)}</span>
          </button>
        );
      })}

      <div className="bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent px-5 pt-8 pb-2 text-lg font-semibold text-ink-text">
        Payday
      </div>
      <p className="px-5 pb-3 text-xs text-ink-muted">
        On the {data.payday.dayOfMonth}
        {ordinalSuffix(data.payday.dayOfMonth)} of every month, your salary lands in{' '}
        {targetAccountName} and every category's spend counter resets to zero.
      </p>

      <button
        onClick={() => setEditingSalary(true)}
        className="flex w-full items-center justify-between border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
      >
        <span className="text-sm text-ink-text">Salary amount</span>
        <span className="text-sm font-medium tabular-nums text-emerald-400">
          {formatMYR(data.payday.salaryAmount)}
        </span>
      </button>

      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-sm text-ink-muted">Goes into</span>
        <span className="text-sm text-ink-text">{targetAccountName}</span>
      </div>

      <QuickEntrySheet
        open={!!editingCategory}
        title={`Set monthly cap — ${editingCategory?.name || ''}`}
        confirmLabel="Save cap"
        onConfirm={setBudgetCap}
        onClose={() => setEditingCategory(null)}
      />

      <QuickEntrySheet
        open={editingSalary}
        title="Set monthly salary amount"
        subtitle={`Deposited into ${targetAccountName} on the ${data.payday.dayOfMonth}${ordinalSuffix(data.payday.dayOfMonth)}`}
        confirmLabel="Save amount"
        onConfirm={setSalaryAmount}
        onClose={() => setEditingSalary(false)}
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
