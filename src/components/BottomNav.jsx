import { Home, PieChart, Landmark, Clock } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', icon: Home, color: '#2DD4BF' },
  { id: 'budgets', label: 'Budgets', icon: PieChart, color: '#818CF8' },
  { id: 'accounts', label: 'Accounts', icon: Landmark, color: '#38BDF8' },
  { id: 'history', label: 'History', icon: Clock, color: '#F472B6' },
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
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors"
            >
              <Icon size={19} color={isActive ? tab.color : '#9195A0'} strokeWidth={2.25} />
              <span style={{ color: isActive ? tab.color : '#9195A0' }} className="font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
