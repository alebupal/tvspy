import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'dvr' | 'default';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  pulse = false,
  className = '',
}) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    primary: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    dvr: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    default: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              variant === 'success'
                ? 'bg-emerald-500'
                : variant === 'danger'
                ? 'bg-rose-500'
                : variant === 'dvr'
                ? 'bg-purple-500'
                : 'bg-sky-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              variant === 'success'
                ? 'bg-emerald-500'
                : variant === 'danger'
                ? 'bg-rose-500'
                : variant === 'dvr'
                ? 'bg-purple-500'
                : 'bg-sky-500'
            }`}
          />
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;

