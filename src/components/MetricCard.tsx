import React from 'react';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  label: string;
  sublabel?: string;
  value: string | number;
  unit?: string;
  history: number[];
  color?: '#00FF9D' | '#06B6D4' | '#F43F5E' | '#F59E0B';
  delta?: {
    value: string;
    isPositiveGood?: boolean;
    isUp?: boolean;
  };
  footnote?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  sublabel,
  value,
  unit,
  history,
  color = '#00FF9D',
  delta,
  footnote,
  className = '',
  onClick
}) => {
  const isHealthy = color === '#00FF9D';
  const isWarning = color === '#F59E0B';
  const isCritical = color === '#F43F5E';
  const isTelemetry = color === '#06B6D4';

  const badgeColorClass = isHealthy
    ? 'text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/30'
    : isCritical
    ? 'text-[#F43F5E] bg-[#F43F5E]/15 border-[#F43F5E]/30'
    : isWarning
    ? 'text-[#F59E0B] bg-[#F59E0B]/12 border-[#F59E0B]/30'
    : 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30';

  return (
    <div
      onClick={onClick}
      className={`relative group bg-[#0D1117] border border-[#1F2937] hover:border-[#374151] hover:bg-[#161B22] transition-all duration-150 rounded-[4px] p-3 flex flex-col justify-between hover:shadow-[0_0_16px_-4px_rgba(6,182,212,0.18)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Header Row with Micro-Label and Sparkline */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-[#849587]">
              {label}
            </span>
            {sublabel && (
              <span className="text-[10px] font-mono text-[#4B5563]">
                [{sublabel}]
              </span>
            )}
          </div>
        </div>

        {/* Live Sparkline */}
        <div className="flex-shrink-0 pt-0.5">
          <Sparkline data={history} color={color} width={80} height={24} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between mt-0.5">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold tracking-tight text-white">
            {value}
          </span>
          {unit && (
            <span className="font-mono text-xs font-medium text-[#849587]">
              {unit}
            </span>
          )}
        </div>

        {/* Delta Tag */}
        {delta && (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${
              delta.isUp
                ? delta.isPositiveGood
                  ? 'text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20'
                  : 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/20'
                : delta.isPositiveGood
                ? 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/20'
                : 'text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20'
            }`}
          >
            {delta.isUp ? '▲' : '▼'} {delta.value}
          </span>
        )}
      </div>

      {/* Micro Status / Footnote */}
      {footnote && (
        <div className="mt-2 pt-2 border-t border-[#1F2937]/60 flex items-center justify-between text-[10px] font-mono text-[#849587]">
          <span className="truncate">{footnote}</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
      )}
    </div>
  );
};
