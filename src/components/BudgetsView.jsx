import React, { useState } from 'react';
import { PieChart, Wallet, DollarSign } from 'lucide-react';
import { useBudgetStore } from '../lib/useBudgetStore';

export default function BudgetsView() {
  const { data, updateData } = useBudgetStore();
  const [editingId, setEditingId] = useState(null);
  const [tempBudget, setTempBudget] = useState('');

  const categories = data?.categories || [];

  // Totals calculations
  const totalBudget = categories.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalSpent = categories.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setTempBudget(cat.budget.toString());
  };

  const handleSave = (catId) => {
    const val = parseFloat(tempBudget);
    if (isNaN(val) || val < 0) return;

    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, budget: val } : c)),
    }));
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-xl font-bold text-ink-text">Category Budgets</h2>

      {/* --- TOTAL BUDGET SUMMARY HERO CARD --- */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-ink-surface to-ink-bg border border-ink-border space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            <PieChart className="w-4 h-4" />
            Total Monthly Summary
          </div>
          <span className="text-xs font-bold text-ink-muted">{overallPercent}% Spent</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 rounded-2xl bg-ink-bg/60 border border-ink-border/50">
            <p className="text-[10px] font-semibold text-ink-muted uppercase">Total Budget</p>
            <p className="text-sm font-bold text-ink-text mt-0.5">RM {totalBudget.toFixed(0)}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-ink-bg/60 border border-ink-border/50">
            <p className="text-[10px] font-semibold text-ink-muted uppercase">Total Spent</p>
            <p className="text-sm font-bold text-status-warn mt-0.5">RM {totalSpent.toFixed(0)}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-ink-bg/60 border border-ink-border/50">
            <p className="text-[10px] font-semibold text-ink-muted uppercase">Remaining</p>
            <p className={`text-sm font-bold mt-0.5 ${totalRemaining >= 0 ? 'text-status-good' : 'text-status-bad'}`}>
              RM {totalRemaining.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-ink-bg h-2.5 rounded-full overflow-hidden border border-ink-border/50">
          <div
            className={`h-full transition-all duration-300 ${
              overallPercent > 90 ? 'bg-status-bad' : overallPercent > 75 ? 'bg-status-warn' : 'bg-accent'
            }`}
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* --- INDIVIDUAL CATEGORIES LIST --- */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const spent = Number(cat.spent) || 0;
          const budget = Number(cat.budget) || 0;
          const remaining = budget - spent;
          const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

          return (
            <div key={cat.id} className="p-4 rounded-2xl bg-ink-surface border border-ink-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-text text-sm">{cat.name}</p>
                  <p className="text-xs text-ink-muted">
                    Spent RM {spent.toFixed(2)} • Remaining RM {remaining.toFixed(2)}
                  </p>
                </div>

                {editingId === cat.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="w-20 p-1.5 rounded-lg bg-ink-bg border border-accent text-ink-text text-xs text-right focus:outline-none"
                    />
                    <button
                      onClick={() => handleSave(cat.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-accent text-ink-bg text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-xs text-accent underline font-semibold"
                  >
                    RM {budget.toFixed(0)} Limit
                  </button>
                )}
              </div>

              {/* Progress Bar per Category */}
              <div className="w-full bg-ink-bg h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${percent > 90 ? 'bg-status-bad' : percent > 75 ? 'bg-status-warn' : 'bg-accent'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}