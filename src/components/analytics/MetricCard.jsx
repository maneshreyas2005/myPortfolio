import React from 'react';

export default function MetricCard({
  label,
  value,
  change,
  changeLabel,
  // eslint-disable-next-line no-unused-vars
  icon: IconComponent,
  color = 'text-accent-orange'
}) {
  const isPositive = change >= 0;
  return (
    <div className="bg-[#161413] border border-white/10 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-[1rem] bg-white/5 flex items-center justify-center text-xs sm:text-sm">
          <IconComponent size={20} />
        </div>
        <div className={`text-right ${color}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1">
            {label}
          </span>
          <span className="text-2xl sm:text-3xl font-black tabular-nums">{value}</span>
          {change !== undefined && (
            <span className={`text-xs font-bold mt-1 block ${isPositive ? 'text-accent-lime' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change} {changeLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
