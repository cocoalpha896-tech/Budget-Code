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
      // Fixed-amount distribution per your answer. Edit target amounts in Settings.
      // targetType is 'bank' or 'investment', targetId matches an id above.
      distribution: [
        { targetType: 'bank', targetId: 'mae', amount: 0 },
        { targetType: 'bank', targetId: 'rhb', amount: 0 },
        { targetType: 'bank', targetId: 'tng', amount: 0 },
        { targetType: 'bank', targetId: 'uob_savings', amount: 0 },
        { targetType: 'investment', targetId: 'tabung_haji', amount: 0 },
        { targetType: 'investment', targetId: 'emergency', amount: 0 },
        { targetType: 'investment', targetId: 'gold', amount: 0 },
        { targetType: 'investment', targetId: 'public_mutual', amount: 0 },
      ],
    },
    currentPeriod: {
      start: null,
      end: null,
    },
    history: [],
  };
}
