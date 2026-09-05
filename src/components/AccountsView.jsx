import { useState } from 'react';
import QuickEntrySheet from './QuickEntrySheet';

function formatMYR(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}RM ${Math.abs(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AccountRow({ label, sub, value, onTap }) {
  return (
    <button
      onClick={onTap}
      className="flex w-full items-center justify-between border-b border-ink-border px-5 py-3.5 text-left active:bg-ink-surface"
    >
      <div>
        <div className="text-sm text-ink-text">{label}</div>
        {sub && <div className="text-xs text-ink-muted">{sub}</div>}
      </div>
      <span className="text-sm tabular-nums text-ink-text">{formatMYR(value)}</span>
    </button>
  );
}

export default function AccountsView({ data, updateData }) {
  // target = { group: 'banks' | 'creditCards' | 'investments', id, field }
  const [target, setTarget] = useState(null);

  const currentValue = () => {
    if (!target) return 0;
    const acct = data.accounts[target.group].find((a) => a.id === target.id);
    return acct ? acct[target.field] : 0;
  };

  const save = (amount) => {
    updateData((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [target.group]: prev.accounts[target.group].map((a) =>
          a.id === target.id ? { ...a, [target.field]: amount } : a
        ),
      },
    }));
  };

  return (
    <div className="pb-24">
      <div className="px-5 pt-6 pb-2 text-lg font-semibold text-ink-text">Bank accounts</div>
      {data.accounts.banks.map((b) => (
        <AccountRow
          key={b.id}
          label={b.name}
          sub={b.note}
          value={b.balance}
          onTap={() => setTarget({ group: 'banks', id: b.id, field: 'balance' })}
        />
      ))}

      <div className="px-5 pt-8 pb-2 text-lg font-semibold text-ink-text">Credit cards</div>
      <p className="px-5 pb-3 text-xs text-ink-muted">Unpaid balance as of your last statement.</p>
      {data.accounts.creditCards.map((c) => (
        <AccountRow
          key={c.id}
          label={c.name}
          value={c.unpaidBalance}
          onTap={() => setTarget({ group: 'creditCards', id: c.id, field: 'unpaidBalance' })}
        />
      ))}

      <div className="px-5 pt-8 pb-2 text-lg font-semibold text-ink-text">
        Investments &amp; savings
      </div>
      {data.accounts.investments.map((i) => (
        <AccountRow
          key={i.id}
          label={i.name}
          value={i.balance}
          onTap={() => setTarget({ group: 'investments', id: i.id, field: 'balance' })}
        />
      ))}

      <QuickEntrySheet
        open={!!target}
        title="Update balance"
        subtitle="Enter the new total, not the change"
        confirmLabel="Save balance"
        onConfirm={save}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
