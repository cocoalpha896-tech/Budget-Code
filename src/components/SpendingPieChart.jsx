import { metaFor } from '../lib/categoryMeta';

function formatMYR(n) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function SpendingPieChart({ categories, title = 'This month' }) {
  const total = categories.reduce((sum, c) => sum + c.spent, 0);
  const size = 150;
  const strokeWidth = 20;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const spent = categories.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-5 px-5 py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2E38" strokeWidth={strokeWidth} />
        {total > 0 &&
          spent.map((c) => {
            const meta = metaFor(c.id);
            const fraction = c.spent / total;
            const dash = fraction * circumference;
            const offset = -((cumulative / total) * circumference);
            cumulative += c.spent;
            return (
              <circle
                key={c.id}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={meta.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })}
      </svg>

      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink-muted">{title} · total spent</div>
        <div className="text-xl font-semibold tabular-nums text-ink-text">{formatMYR(total)}</div>

        <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1">
          {total === 0 && <div className="text-xs text-ink-muted">No spending logged yet</div>}
          {spent.map((c) => {
            const meta = metaFor(c.id);
            return (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} />
                <span className="flex-1 truncate text-ink-muted">{c.name}</span>
                <span className="tabular-nums text-ink-text">
                  {Math.round((c.spent / total) * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
