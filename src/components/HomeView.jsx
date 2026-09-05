import { useState } from 'react';
import LiquidityHero from './LiquidityHero';
import CategoryRow from './CategoryRow';
import LogSpendSheet from './LogSpendSheet';
import SpendingPieChart from './SpendingPieChart';
import ActivityList from './ActivityList';
import { applyTransactionToAccounts } from '../lib/transactions';

export default function HomeView({ data, updateData }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const logSpend = ({ amount, note, accountId, accountType }) => {
    updateData((prev) => {
      const transaction = {
        id: crypto.randomUUID(),
        categoryId: activeCategory.id,
        amount,
        note,
        accountId,
        accountType,
        date: new Date().toISOString(),
      };
      return {
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === activeCategory.id ? { ...c, spent: c.spent + amount } : c
        ),
        accounts: applyTransactionToAccounts(prev.accounts, { accountId, accountType, amount }),
        currentPeriod: {
          ...prev.currentPeriod,
          transactions: [...(prev.currentPeriod.transactions || []), transaction],
        },
      };
    });
  };

  const recent = (data.currentPeriod.transactions || []).slice(-8);

  return (
    <div className="pb-24">
      <LiquidityHero data={data} />

      <div className="border-t border-ink-border">
        <SpendingPieChart categories={data.categories} />
      </div>

      <div className="border-t border-ink-border px-5 pb-2 pt-5 text-sm font-medium text-ink-text">
        Categories
      </div>
      <div>
        {data.categories.map((c) => (
          <CategoryRow key={c.id} category={c} onTapSpend={setActiveCategory} />
        ))}
      </div>

      <div className="px-5 pb-2 pt-6 text-sm font-medium text-ink-text">Recent activity</div>
      <ActivityList transactions={recent} categories={data.categories} groupByDate />

      <LogSpendSheet
        open={!!activeCategory}
        categoryName={activeCategory?.name || ''}
        accounts={data.accounts}
        onConfirm={logSpend}
        onClose={() => setActiveCategory(null)}
      />
    </div>
  );
}
