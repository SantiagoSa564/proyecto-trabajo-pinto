import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string; // e.g. '#00FF9D' or '#06B6D4' or '#F43F5E'
  height?: number;
  width?: number;
  showFill?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#00FF9D',
  height = 28,
  width = 96,
  showFill = true
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-20 bg-gray-800 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const fillPathData = `${pathData} L ${width - padding},${height} L ${padding},${height} Z`;

  // generate unique gradient ID based on color
  const gradId = `spark-grad-${color.replace('#', '')}-${width}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {showFill && (
        <path d={fillPathData} fill={`url(#${gradId})`} />
      )}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 3px ${color}88)`
        }}
      />
      {/* Latest value point beacon */}
      {points.length > 0 && (
        <circle
          cx={parseFloat(points[points.length - 1].split(',')[0])}
          cy={parseFloat(points[points.length - 1].split(',')[1])}
          r="2.5"
          fill="#ffffff"
          stroke={color}
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
};
