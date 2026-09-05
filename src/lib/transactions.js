// Debit/savings accounts: spending decreases the balance.
// Credit cards: spending increases the unpaid balance (money owed), balance itself untouched.
export function applyTransactionToAccounts(accounts, { accountId, accountType, amount }) {
  if (accountType === 'creditCard') {
    return {
      ...accounts,
      creditCards: accounts.creditCards.map((c) =>
        c.id === accountId ? { ...c, unpaidBalance: c.unpaidBalance + amount } : c
      ),
    };
  }
  return {
    ...accounts,
    banks: accounts.banks.map((b) => (b.id === accountId ? { ...b, balance: b.balance - amount } : b)),
  };
}

// All accounts a spend can be paid from — banks and credit cards, not investments.
export function paymentSources(accounts) {
  return [
    ...accounts.banks.map((a) => ({ ...a, type: 'bank' })),
    ...accounts.creditCards.map((c) => ({ ...c, type: 'creditCard', balance: c.unpaidBalance })),
  ];
}
