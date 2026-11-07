import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  badge?: React.ReactNode;
  sparkline?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  sparkline,
  color = 'primary',
}) => {
  const bgStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    info: 'bg-sky-500/10 text-sky-500',
  };

  return (
    <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm transition hover:shadow-md dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgStyles[color]}`}
        >
          {icon}
        </div>
        {badge && <div>{badge}</div>}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-2xl font-bold text-black dark:text-white tracking-tight">
            {value}
          </h4>
          <span className="text-sm font-medium text-body dark:text-bodydark">
            {title}
          </span>
        </div>
        {sparkline && <div>{sparkline}</div>}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-body dark:text-bodydark border-t border-stroke/60 pt-2 dark:border-strokedark/60">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;

