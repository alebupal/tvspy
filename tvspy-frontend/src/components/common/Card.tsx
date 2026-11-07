import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={`rounded-xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stroke dark:border-strokedark">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-black dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-body dark:text-bodydark mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

