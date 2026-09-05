import { computeCCLiquidity, daysUntil } from '../lib/paydayEngine';

function formatMYR(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}RM ${Math.abs(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function LiquidityHero({ data }) {
  const liquidity = computeCCLiquidity(data);
  const isPositive = liquidity >= 0;
  const days = data.currentPeriod?.end ? daysUntil(data.currentPeriod.end) : null;

  return (
    <div className="px-5 pt-6 pb-5">
      <div className="text-sm text-ink-muted">Net card liquidity</div>
      <div
        className={`mt-1 text-4xl font-semibold tabular-nums tracking-tight ${
          isPositive ? 'text-ink-text' : 'text-status-bad'
        }`}
      >
        {formatMYR(liquidity)}
      </div>
      <div className="mt-1 text-xs text-ink-muted">
        UOB Savings minus all 4 card balances
      </div>

      {days !== null && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Next payday in</span>
          <span className="font-medium text-accent">{days} day{days === 1 ? '' : 's'}</span>
        </div>
      )}
    </div>
  );
}
