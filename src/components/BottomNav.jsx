const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'history', label: 'History' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-ink-border bg-ink-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 py-3 text-sm transition-colors"
            >
              <span className={isActive ? 'text-accent font-medium' : 'text-ink-muted'}>
                {tab.label}
              </span>
              {isActive && <div className="mx-auto mt-1 h-0.5 w-6 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
