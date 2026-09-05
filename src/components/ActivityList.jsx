import { Landmark, CreditCard } from 'lucide-react';
import { metaFor } from '../lib/categoryMeta';

function formatMYR(n) {
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateHeader(iso) {
  return new Date(iso).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
}

function categoryName(categories, categoryId) {
  return categories.find((c) => c.id === categoryId)?.name || categoryId;
}

function groupByDay(transactions) {
  const groups = {};
  transactions.forEach((t) => {
    const key = new Date(t.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

function Row({ t, categories }) {
  const { icon: Icon, color } = metaFor(t.categoryId);
  const AccountIcon = t.accountType === 'creditCard' ? CreditCard : Landmark;

  return (
    <div className="flex items-center gap-3 border-b border-ink-border px-5 py-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}26` }}
      >
        <Icon size={15} color={color} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-ink-text">{t.note || categoryName(categories, t.categoryId)}</div>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <span>{categoryName(categories, t.categoryId)}</span>
          {t.accountId && (
            <>
              <span>·</span>
              <AccountIcon size={11} />
            </>
          )}
        </div>
      </div>
      <div
        className={`shrink-0 text-sm tabular-nums ${
          t.accountType === 'creditCard' ? 'text-rose-300' : 'text-ink-text'
        }`}
      >
        {formatMYR(t.amount)}
      </div>
    </div>
  );
}

export default function ActivityList({
  transactions,
  categories,
  emptyLabel = 'No spending logged yet',
  groupByDate = false,
}) {
  if (!transactions || transactions.length === 0) {
    return <div className="px-5 py-4 text-xs text-ink-muted">{emptyLabel}</div>;
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!groupByDate) {
    return <div>{sorted.map((t) => <Row key={t.id} t={t} categories={categories} />)}</div>;
  }

  return (
    <div>
      {groupByDay(sorted).map(([dayKey, items]) => (
        <div key={dayKey}>
          <div className="bg-ink-bg px-5 py-1.5 text-xs font-medium text-ink-muted">
            {formatDateHeader(items[0].date)}
          </div>
          {items.map((t) => (
            <Row key={t.id} t={t} categories={categories} />
          ))}
        </div>
      ))}
    </div>
  );
}
