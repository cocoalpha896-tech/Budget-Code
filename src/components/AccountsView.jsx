import React, { useState } from 'react';
import { ArrowLeftRight, CreditCard, PlusCircle, X, Building2, TrendingUp, History } from 'lucide-react';
import { useBudgetStore } from '../lib/useBudgetStore';

export default function AccountsView() {
  const { data, executeTransfer, executeCardPayment, executeIncome } = useBudgetStore();

  // Modal display states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  // Form states - Transfer
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Form states - Credit Card Payment
  const [creditCardId, setCreditCardId] = useState('');
  const [paidFromAccountId, setPaidFromAccountId] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [cardNote, setCardNote] = useState('');

  // Form states - Income
  const [incomeAccountId, setIncomeAccountId] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeNote, setIncomeNote] = useState('');

  const banks = data?.accounts?.banks || [];
  const creditCards = data?.accounts?.creditCards || [];
  const investments = data?.accounts?.investments || [];
  const depositAccounts = [...banks, ...investments];
  const allAccounts = [...banks, ...creditCards, ...investments];

  // Account lookup helper
  const getAccountName = (id) => allAccounts.find((a) => a.id === id)?.name || id;

  // Open Handlers
  const handleOpenTransfer = () => {
    setFromAccountId(banks[0]?.id || '');
    setToAccountId(investments[0]?.id || banks[1]?.id || '');
    setTransferAmount('');
    setTransferNote('');
    setShowTransferModal(true);
  };

  const handleOpenCardModal = (defaultCardId = '') => {
    const targetCard = creditCards.find((c) => c.id === defaultCardId) || creditCards[0];
    setCreditCardId(targetCard?.id || '');
    setPaidFromAccountId(banks[0]?.id || '');
    setCardAmount(targetCard ? (targetCard.unpaidBalance ?? targetCard.balance ?? 0).toString() : '');
    setCardNote('');
    setShowCardModal(true);
  };

  const handleOpenIncome = () => {
    setIncomeAccountId(banks[0]?.id || '');
    setIncomeAmount('');
    setIncomeNote('');
    setShowIncomeModal(true);
  };

  // Submit Handlers
  const onTransferSubmit = (e) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !transferAmount || fromAccountId === toAccountId) return;
    executeTransfer({ fromAccountId, toAccountId, amount: parseFloat(transferAmount), note: transferNote });
    setShowTransferModal(false);
  };

  const onCardPaymentSubmit = (e) => {
    e.preventDefault();
    if (!creditCardId || !paidFromAccountId || !cardAmount) return;
    executeCardPayment({ creditCardId, paidFromAccountId, amount: parseFloat(cardAmount), note: cardNote });
    setShowCardModal(false);
  };

  const onIncomeSubmit = (e) => {
    e.preventDefault();
    if (!incomeAccountId || !incomeAmount) return;
    executeIncome({ accountId: incomeAccountId, amount: parseFloat(incomeAmount), note: incomeNote });
    setShowIncomeModal(false);
  };

  const accountTransactions = (data?.transactions || []).filter((tx) =>
    ['transfer', 'cc_payment', 'income'].includes(tx.type)
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Quick Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-text">Accounts</h2>
        <div className="flex gap-1.5">
          <button
            onClick={handleOpenIncome}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl bg-status-good/20 text-status-good border border-status-good/30 active:scale-95 transition-transform"
          >
            <PlusCircle className="w-4 h-4" />
            Income
          </button>
          <button
            onClick={handleOpenTransfer}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl bg-ink-surface text-accent border border-ink-border active:scale-95 transition-transform"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer
          </button>
          <button
            onClick={() => handleOpenCardModal()}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl bg-accent text-ink-bg active:scale-95 transition-transform"
          >
            <CreditCard className="w-4 h-4" />
            Pay Card
          </button>
        </div>
      </div>

      {/* Bank & Savings Accounts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          <Building2 className="w-4 h-4 text-accent" />
          Bank Accounts & Savings
        </div>
        <div className="grid gap-2">
          {banks.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-ink-surface border border-ink-border">
              <div>
                <p className="font-semibold text-ink-text text-sm">{acc.name}</p>
                <p className="text-xs text-ink-muted">Liquid Account</p>
              </div>
              <p className="text-base font-bold text-status-good">
                RM {(acc.balance || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-status-warn" />
            Credit Cards (Unpaid Balance)
          </div>
        </div>
        <div className="grid gap-2">
          {creditCards.map((card) => {
            const bal = card.unpaidBalance ?? card.balance ?? 0;
            return (
              <div key={card.id} className="flex items-center justify-between p-4 rounded-2xl bg-ink-surface border border-ink-border">
                <div>
                  <p className="font-semibold text-ink-text text-sm">{card.name}</p>
                  <button onClick={() => handleOpenCardModal(card.id)} className="mt-1 text-xs text-accent underline font-medium">
                    Pay off card
                  </button>
                </div>
                <p className="text-base font-bold text-status-bad">
                  RM {bal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Investments & Other */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          <TrendingUp className="w-4 h-4 text-accent" />
          Investments & Allocations
        </div>
        <div className="grid gap-2">
          {investments.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-ink-surface border border-ink-border">
              <p className="font-semibold text-ink-text text-sm">{inv.name}</p>
              <p className="text-base font-bold text-ink-text">
                RM {(inv.balance || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- ACCOUNT TRANSFER & ACTIVITY HISTORY --- */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
          <History className="w-4 h-4 text-accent" />
          Transfer & Account History
        </div>

        {accountTransactions.length === 0 ? (
          <p className="text-xs text-ink-muted italic p-4 bg-ink-surface rounded-2xl border border-ink-border">
            No transfers or account activity recorded yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {accountTransactions.slice(0, 15).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-ink-surface border border-ink-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-ink-text">
                    {tx.type === 'transfer' && `Transfer: ${getAccountName(tx.fromAccountId)} → ${getAccountName(tx.toAccountId)}`}
                    {tx.type === 'cc_payment' && `Card Pay: ${getAccountName(tx.paidFromAccountId)} → ${getAccountName(tx.creditCardId)}`}
                    {tx.type === 'income' && `Income into ${getAccountName(tx.accountId)}`}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    {new Date(tx.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {tx.note && ` • ${tx.note}`}
                  </p>
                </div>
                <p className={`text-sm font-bold ${
                  tx.type === 'income' ? 'text-status-good' : tx.type === 'cc_payment' ? 'text-accent' : 'text-ink-text'
                }`}>
                  {tx.type === 'income' ? '+' : ''}RM {tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- ADD INCOME MODAL --- */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ink-surface border border-ink-border rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink-text flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-status-good" />
                Add Income / Money In
              </h3>
              <button onClick={() => setShowIncomeModal(false)} className="p-2 rounded-full text-ink-muted hover:text-ink-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Deposit To Account</label>
                <select
                  value={incomeAccountId}
                  onChange={(e) => setIncomeAccountId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                >
                  {depositAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (RM {(acc.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Freelance project, Claim refund"
                  value={incomeNote}
                  onChange={(e) => setIncomeNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-ink-bg text-ink-muted text-sm font-semibold border border-ink-border"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-3 rounded-xl bg-status-good text-ink-bg text-sm font-bold active:scale-95 transition-transform">
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TRANSFER MONEY MODAL --- */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ink-surface border border-ink-border rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink-text flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-accent" />
                Transfer Money
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="p-2 rounded-full text-ink-muted hover:text-ink-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">From Account</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                >
                  {depositAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (RM {(acc.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Transfer To</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                >
                  {depositAccounts
                    .filter((acc) => acc.id !== fromAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (RM {(acc.balance || 0).toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Salary transfer to Tabung Haji"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-ink-bg text-ink-muted text-sm font-semibold border border-ink-border"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-3 rounded-xl bg-accent text-ink-bg text-sm font-bold active:scale-95 transition-transform">
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREDIT CARD PAYMENT MODAL --- */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ink-surface border border-ink-border rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink-text flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-status-warn" />
                Pay Credit Card
              </h3>
              <button onClick={() => setShowCardModal(false)} className="p-2 rounded-full text-ink-muted hover:text-ink-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onCardPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Credit Card to Pay</label>
                <select
                  value={creditCardId}
                  onChange={(e) => {
                    setCreditCardId(e.target.value);
                    const card = creditCards.find((c) => c.id === e.target.value);
                    if (card) setCardAmount((card.unpaidBalance ?? card.balance ?? 0).toString());
                  }}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                >
                  {creditCards.map((card) => {
                    const bal = card.unpaidBalance ?? card.balance ?? 0;
                    return (
                      <option key={card.id} value={card.id}>
                        {card.name} (Owed: RM {bal.toFixed(2)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Paid From Account</label>
                <select
                  value={paidFromAccountId}
                  onChange={(e) => setPaidFromAccountId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                >
                  {banks.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Balance: RM {(acc.balance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Payment Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Full statement payment"
                  value={cardNote}
                  onChange={(e) => setCardNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-ink-bg text-ink-muted text-sm font-semibold border border-ink-border"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-3 rounded-xl bg-accent text-ink-bg text-sm font-bold active:scale-95 transition-transform">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}