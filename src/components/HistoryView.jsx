import { useState } from 'react';
import SpendingPieChart from './SpendingPieChart';
import ActivityList from './ActivityList';

function formatMYR(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}RM ${Math.abs(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function HistoryView({ data }) {
  const [index, setIndex] = useState(0);
  const periods = data.history;

  if (!periods.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="text-sm text-ink-text">No history yet</div>
        <p className="mt-1 max-w-xs text-xs text-ink-muted">
          Your first past-month breakdown will show up here right after your next payday
          reset, on the {data.payday.dayOfMonth}
          {ordinalSuffix(data.payday.dayOfMonth)}.
        </p>
      </div>
    );
  }

  const period = periods[index];

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <button
          disabled={index >= periods.length - 1}
          onClick={() => setIndex((i) => Math.min(periods.length - 1, i + 1))}
          className="text-sm text-accent disabled:opacity-30"
        >
          ← Older
        </button>
        <div className="text-sm font-medium text-ink-text">{period.period}</div>
        <button
          disabled={index <= 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="text-sm text-accent disabled:opacity-30"
        >
          Newer →
        </button>
      </div>

      <div className="border-y border-ink-border">
        <SpendingPieChart categories={period.categories} title={period.period} />
      </div>

      <div className="flex justify-between border-b border-ink-border px-5 py-3.5">
        <span className="text-sm text-ink-muted">CC liquidity at reset</span>
        <span
          className={`text-sm font-medium tabular-nums ${
            period.ccLiquidity < 0 ? 'text-status-bad' : 'text-ink-text'
          }`}
        >
          {formatMYR(period.ccLiquidity)}
        </span>
      </div>

      <div className="px-5 pt-6 pb-2 text-sm font-medium text-ink-text">By category</div>
      {period.categories.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between border-b border-ink-border px-5 py-3"
        >
          <span className="text-sm text-ink-text">{c.name}</span>
          <span
            className={`text-sm tabular-nums ${
              c.spent > c.budget ? 'text-status-bad' : 'text-ink-muted'
            }`}
          >
            {formatMYR(c.spent)} / {formatMYR(c.budget)}
          </span>
        </div>
      ))}

      <div className="px-5 pb-2 pt-6 text-sm font-medium text-ink-text">All spending this period</div>
      <ActivityList
        transactions={period.transactions}
        categories={period.categories}
        emptyLabel="No itemized entries were saved for this period"
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
