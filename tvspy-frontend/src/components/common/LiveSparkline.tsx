import React, { useState, useEffect } from 'react';

interface LiveSparklineProps {
  currentValue: number;
  maxPoints?: number;
  height?: number;
  color?: string;
}

export const LiveSparkline: React.FC<LiveSparklineProps> = ({
  currentValue,
  maxPoints = 25,
  height = 40,
  color = '#3C50E0',
}) => {
  const [history, setHistory] = useState<number[]>(() => Array(maxPoints).fill(0));

  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev.slice(1), currentValue];
      return next;
    });
  }, [currentValue, maxPoints]);

  const max = Math.max(...history, 1024);
  const min = Math.min(...history, 0);
  const range = max - min || 1;

  const width = 120;
  const step = width / (history.length - 1);

  const points = history.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative overflow-hidden" style={{ width: `${width}px`, height: `${height}px` }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#sparkline-grad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default LiveSparkline;

