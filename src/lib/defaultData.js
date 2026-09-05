// src/lib/defaultData.js

export const defaultCategories = [
  { id: 'food', name: 'Food', budget: 800, spent: 0, iconKey: 'Utensils', color: '#F59E0B' },
  { id: 'house', name: 'House', budget: 1000, spent: 0, iconKey: 'Home', color: '#3B82F6' },
  { id: 'parents', name: 'Parents', budget: 500, spent: 0, iconKey: 'Heart', color: '#EC4899' },
  { id: 'phone', name: 'Phone', budget: 100, spent: 0, iconKey: 'Smartphone', color: '#8B5CF6' },
  { id: 'fuel', name: 'Fuel & Toll', budget: 300, spent: 0, iconKey: 'Car', color: '#EF4444' },
  { id: 'dating', name: 'Dating', budget: 300, spent: 0, iconKey: 'Smile', color: '#F472B6' },
  { id: 'toiletries', name: 'Toiletries', budget: 150, spent: 0, iconKey: 'ShoppingBag', color: '#10B981' },
  { id: 'shopping', name: 'Shopping', budget: 200, spent: 0, iconKey: 'ShoppingCart', color: '#6366F1' },
  { id: 'gym', name: 'Gym', budget: 150, spent: 0, iconKey: 'Dumbbell', color: '#14B8A6' },
  { id: 'loan', name: 'Loan', budget: 0, spent: 0, iconKey: 'Landmark', color: '#64748B' },
  { id: 'other', name: 'Other', budget: 0, spent: 0, iconKey: 'MoreHorizontal', color: '#94A3B8' }
];

export function makeDefaultData() {
  return {
    accounts: {
      banks: [
        { id: 'maybank_savings', name: 'Maybank Savings', balance: 0 },
        { id: 'maybank_mae', name: 'Maybank MAE', balance: 0 },
        { id: 'rhb_bank', name: 'RHB Bank', balance: 0 },
        { id: 'tng_ewallet', name: 'TNG eWallet', balance: 0 },
        { id: 'uob_savings', name: 'UOB Savings', balance: 0 }
      ],
      creditCards: [
        { id: 'uob_card', name: 'UOB Card', balance: 0, unpaidBalance: 0 },
        { id: 'hsbc_card', name: 'HSBC Card', balance: 0, unpaidBalance: 0 },
        { id: 'maybank_amex', name: 'Maybank AMEX', balance: 0, unpaidBalance: 0 },
        { id: 'maybank_shopee', name: 'Maybank Shopee', balance: 0, unpaidBalance: 0 }
      ],
      investments: [
        { id: 'tabung_haji', name: 'Tabung Haji', balance: 0 },
        { id: 'emergency_fund', name: 'Emergency Fund', balance: 0 },
        { id: 'gold', name: 'Gold', balance: 0 },
        { id: 'public_mutual', name: 'Public Mutual', balance: 0 }
      ]
    },
    categories: defaultCategories,
    payday: {
      dayOfMonth: 27,
      salaryAmount: 3700,
      targetAccountId: 'maybank_savings'
    },
    currentPeriod: { start: null, end: null, transactions: [] },
    history: [],
    transactions: []
  };
}

export function migrateData(raw) {
  if (!raw) return makeDefaultData();
  const data = structuredClone(raw);

  if (!data.categories) {
    data.categories = defaultCategories;
  } else {
    const existingIds = data.categories.map((c) => c.id);
    const categoriesToAdd = [
      { id: 'loan', name: 'Loan', budget: 0, spent: 0, iconKey: 'Landmark', color: '#64748B' },
      { id: 'other', name: 'Other', budget: 0, spent: 0, iconKey: 'MoreHorizontal', color: '#94A3B8' }
    ];

    categoriesToAdd.forEach((cat) => {
      if (!existingIds.includes(cat.id)) {
        data.categories.push(cat);
      }
    });
  }

  return data;
}