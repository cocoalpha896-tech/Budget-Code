import { useEffect, useRef, useState } from 'react';
import { Landmark, CreditCard } from 'lucide-react';

export default function LogSpendSheet({ open, categoryName, accounts, onConfirm, onClose }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState(null); // { id, type, name }
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setAmount('');
      setNote('');
      setSelected(null);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  if (!open) return null;

  const banks = accounts.banks;
  const cards = accounts.creditCards;
  const canSubmit = parseFloat(amount) > 0 && !!selected;

  const submit = () => {
    const num = parseFloat(amount);
    if (!Number.isNaN(num) && num > 0 && selected) {
      onConfirm({ amount: num, note: note.trim(), accountId: selected.id, accountType: selected.type });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-ink-border bg-ink-surface p-5 animate-[slideUp_0.22s_ease-out]"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-border" />
        <div className="text-base font-medium text-ink-text">Log spend — {categoryName}</div>

        <div className="mt-4 flex items-center rounded-xl border border-ink-border bg-ink-bg px-4 py-3">
          <span className="mr-2 text-ink-muted">RM</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-lg tabular-nums text-ink-text outline-none"
            placeholder="0.00"
          />
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was this for? (optional)"
          className="mt-2 w-full rounded-xl border border-ink-border bg-ink-bg px-4 py-3 text-sm text-ink-text outline-none placeholder:text-ink-muted"
        />

        <div className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Paid from — debit / savings
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {banks.map((b) => {
            const isSelected = selected?.id === b.id && selected?.type === 'bank';
            return (
              <button
                key={b.id}
                onClick={() => setSelected({ id: b.id, type: 'bank', name: b.name })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-ink-border bg-ink-bg text-ink-muted'
                }`}
              >
                <Landmark size={13} />
                {b.name}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Paid from — credit card
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {cards.map((c) => {
            const isSelected = selected?.id === c.id && selected?.type === 'creditCard';
            return (
              <button
                key={c.id}
                onClick={() => setSelected({ id: c.id, type: 'creditCard', name: c.name })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'border-rose-400 bg-rose-400/15 text-rose-300'
                    : 'border-ink-border bg-ink-bg text-ink-muted'
                }`}
              >
                <CreditCard size={13} />
                {c.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-sky-400 py-3.5 text-sm font-semibold text-ink-bg transition-opacity disabled:opacity-30"
        >
          Add spend
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
