import React from 'react';
import { Wallet } from 'lucide-react';
import { computeCCLiquidity } from '../lib/paydayEngine';

export default function LiquidityHero({ data }) {
  const liquidity = computeCCLiquidity(data);
  const bankTotal = data?.accounts?.banks?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0;
  const ccTotal = data?.accounts?.creditCards?.reduce((sum, c) => sum + (c.unpaidBalance ?? c.balance ?? 0), 0) || 0;

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-ink-surface to-ink-bg border border-ink-border space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
          <Wallet className="w-4 h-4" />
          Net Card Liquidity
        </div>
        <span className="text-[10px] font-semibold text-ink-muted">Banks − CC Unpaid</span>
      </div>

      <div>
        <p className={`text-2xl font-extrabold ${liquidity >= 0 ? 'text-status-good' : 'text-status-bad'}`}>
          RM {liquidity.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted pt-1 border-t border-ink-border/50">
        <span>Bank Savings: RM {bankTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
        <span>CC Owed: RM {ccTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}