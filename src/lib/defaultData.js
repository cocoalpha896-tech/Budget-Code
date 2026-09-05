export function makeDefaultData() {
  return {
    schemaVersion: 1,
    accounts: {
      banks: [
        { id: 'mae', name: 'Maybank MAE', balance: 0 },
        { id: 'mb_savings', name: 'Maybank Savings', balance: 0 },
        { id: 'rhb', name: 'RHB Bank', note: 'Food allocation', balance: 0 },
        { id: 'tng', name: 'TNG eWallet', note: 'Gas & Toll', balance: 0 },
        { id: 'uob_savings', name: 'UOB Savings', note: 'Credit card reserve', balance: 0 },
      ],
      creditCards: [
        { id: 'uob_cc', name: 'UOB', unpaidBalance: 0 },
        { id: 'hsbc_cc', name: 'HSBC', unpaidBalance: 0 },
        { id: 'amex_cc', name: 'Maybank AMEX', unpaidBalance: 0 },
        { id: 'shopee_cc', name: 'Maybank Shopee', unpaidBalance: 0 },
      ],
      investments: [
        { id: 'tabung_haji', name: 'Tabung Haji', balance: 0 },
        { id: 'emergency', name: 'Emergency Account', balance: 0 },
        { id: 'gold', name: 'Gold', balance: 0 },
        { id: 'public_mutual', name: 'Public Mutual', balance: 0 },
      ],
    },
    categories: [
      { id: 'food', name: 'Food', budget: 0, spent: 0 },
      { id: 'house', name: 'House', budget: 0, spent: 0 },
      { id: 'parents', name: 'Parents', budget: 0, spent: 0 },
      { id: 'phone', name: 'Phone', budget: 0, spent: 0 },
      { id: 'fuel_toll', name: 'Fuel & Toll', budget: 0, spent: 0 },
      { id: 'dating', name: 'Dating', budget: 0, spent: 0 },
      { id: 'toiletries', name: 'Toiletries', budget: 0, spent: 0 },
      { id: 'shopping', name: 'Shopping', budget: 0, spent: 0 },
      { id: 'gym', name: 'Gym', budget: 0, spent: 0 },
    ],
    payday: {
      dayOfMonth: 27,
      // Salary lands in one account (Maybank Savings) — editable amount, fixed destination.
      salaryAmount: 3700,
      targetAccountId: 'mb_savings',
    },
    currentPeriod: {
      start: null,
      end: null,
      // Individual logged spends: { id, categoryId, amount, note, date, accountId, accountType }
      // accountType is 'bank' or 'creditCard' — this is what drives automatic balance
      // deduction / credit card owed-amount tracking, so nothing needs manual re-entry.
      transactions: [],
    },
    history: [],
  };
}

// Fills in any fields missing from an older saved budget_data.json (e.g. one
// created before the salary/transactions model existed) with sane defaults,
// instead of letting the app crash on a missing field.
export function migrateData(data) {
  const fresh = makeDefaultData();
  return {
    ...fresh,
    ...data,
    accounts: data.accounts ?? fresh.accounts,
    categories: data.categories ?? fresh.categories,
    payday: {
      dayOfMonth: data.payday?.dayOfMonth ?? fresh.payday.dayOfMonth,
      salaryAmount: data.payday?.salaryAmount ?? fresh.payday.salaryAmount,
      targetAccountId: data.payday?.targetAccountId ?? fresh.payday.targetAccountId,
    },
    currentPeriod: {
      start: data.currentPeriod?.start ?? null,
      end: data.currentPeriod?.end ?? null,
      transactions: data.currentPeriod?.transactions ?? [],
    },
    history: data.history ?? [],
  };
}
