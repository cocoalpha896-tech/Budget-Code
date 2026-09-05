import { useState } from 'react';
import LiquidityHero from './LiquidityHero';
import CategoryRow from './CategoryRow';
import QuickEntrySheet from './QuickEntrySheet';

export default function HomeView({ data, updateData }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const logSpend = (amount) => {
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === activeCategory.id ? { ...c, spent: c.spent + amount } : c
      ),
    }));
  };

  return (
    <div className="pb-24">
      <LiquidityHero data={data} />

      <div className="px-5 pb-2 text-sm font-medium text-ink-text">This month</div>
      <div>
        {data.categories.map((c) => (
          <CategoryRow key={c.id} category={c} onTapSpend={setActiveCategory} />
        ))}
      </div>

      <QuickEntrySheet
        open={!!activeCategory}
        title={`Log spend — ${activeCategory?.name || ''}`}
        subtitle="Amount will be added to this category's spend"
        confirmLabel="Add spend"
        onConfirm={logSpend}
        onClose={() => setActiveCategory(null)}
      />
    </div>
  );
}
