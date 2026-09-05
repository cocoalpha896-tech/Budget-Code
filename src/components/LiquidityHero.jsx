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
    <div className="relative overflow-hidden px-5 pb-6 pt-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(120% 100% at 0% 0%, rgba(45,212,191,0.22) 0%, transparent 55%), radial-gradient(120% 100% at 100% 0%, rgba(129,140,248,0.20) 0%, transparent 55%)',
        }}
      />
      <div className="relative">
        <div className="text-sm text-ink-muted">Net card liquidity</div>
        <div
          className={`mt-1 bg-gradient-to-r bg-clip-text text-4xl font-bold tabular-nums tracking-tight text-transparent ${
            isPositive ? 'from-accent to-sky-400' : 'from-rose-400 to-rose-300'
          }`}
        >
          {formatMYR(liquidity)}
        </div>
        <div className="mt-1 text-xs text-ink-muted">UOB Savings minus all 4 card balances</div>

        {days !== null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm">
            <span className="text-ink-muted">Next payday in</span>
            <span className="font-semibold text-emerald-400">
              {days} day{days === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
