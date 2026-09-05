function formatMYR(n) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CategoryRow({ category, onTapSpend }) {
  const { name, budget, spent } = category;
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  let barColor = 'bg-status-good';
  if (budget > 0 && spent / budget >= 1) barColor = 'bg-status-bad';
  else if (budget > 0 && spent / budget >= 0.8) barColor = 'bg-status-warn';

  return (
    <button
      onClick={() => onTapSpend(category)}
      className="w-full border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-text">{name}</span>
        <span
          className={`text-sm tabular-nums ${remaining < 0 ? 'text-status-bad' : 'text-ink-muted'}`}
        >
          {remaining < 0 ? '-' : ''}
          {formatMYR(Math.abs(remaining))} left
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-border">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-1 text-xs text-ink-muted tabular-nums">
        {formatMYR(spent)} of {formatMYR(budget)}
      </div>
    </button>
  );
}
