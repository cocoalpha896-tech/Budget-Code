import { useEffect, useRef, useState } from 'react';

export default function QuickEntrySheet({ open, title, subtitle, confirmLabel, onConfirm, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const num = parseFloat(value);
    if (!Number.isNaN(num)) {
      onConfirm(num);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full rounded-t-2xl border-t border-ink-border bg-ink-surface p-5 pb-8 animate-[slideUp_0.22s_ease-out]"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-border" />
        <div className="text-base font-medium text-ink-text">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-ink-muted">{subtitle}</div>}

        <div className="mt-4 flex items-center rounded-xl border border-ink-border bg-ink-bg px-4 py-3">
          <span className="mr-2 text-ink-muted">RM</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full bg-transparent text-lg tabular-nums text-ink-text outline-none"
            placeholder="0.00"
          />
        </div>

        <button
          onClick={submit}
          className="mt-4 w-full rounded-xl bg-accent py-3.5 text-sm font-medium text-ink-bg active:opacity-80"
        >
          {confirmLabel || 'Save'}
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
