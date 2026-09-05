import { useState } from 'react';
import { useBudgetStore } from './lib/useBudgetStore';
import LoginScreen from './components/LoginScreen';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import BudgetsView from './components/BudgetsView';
import AccountsView from './components/AccountsView';
import HistoryView from './components/HistoryView';

const SYNC_LABEL = {
  idle: '',
  saving: 'Saving…',
  saved: 'Synced',
  offline: 'Offline — will retry',
};

export default function App() {
  const { status, error, data, updateData, signIn, signOut, syncState } = useBudgetStore();
  const [tab, setTab] = useState('home');

  if (status === 'init' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        Loading your budget…
      </div>
    );
  }

  if (status === 'signed-out' || status === 'error') {
    return <LoginScreen onSignIn={signIn} error={error} />;
  }

  if (!data) return null;

  return (
    <div className="mx-auto min-h-screen max-w-md text-ink-text">
      <header className="flex items-center justify-between px-5 pt-3">
        <span className="text-xs text-ink-muted">{SYNC_LABEL[syncState]}</span>
        <button onClick={signOut} className="text-xs text-ink-muted underline">
          Sign out
        </button>
      </header>

      {tab === 'home' && <HomeView data={data} updateData={updateData} />}
      {tab === 'budgets' && <BudgetsView data={data} updateData={updateData} />}
      {tab === 'accounts' && <AccountsView data={data} updateData={updateData} />}
      {tab === 'history' && <HistoryView data={data} />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
