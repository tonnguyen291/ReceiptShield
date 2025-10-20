"use client";

import { cn } from "@/lib/utils";

interface OriginMiniChartProps {
  data: number[];
  type?: "line" | "bar" | "sparkline";
  color?: string;
  height?: number;
  className?: string;
  showTrend?: boolean;
}

export function OriginMiniChart({
  data,
  type = "line",
  color = "hsl(var(--primary))",
  height = 40,
  className,
  showTrend = true
}: OriginMiniChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center text-muted-foreground text-xs", className)}
        style={{ height }}
      >
        No data
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const stepX = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const trendPercentage = data.length > 1 ? ((trend / data[0]) * 100) : 0;

  return (
    <div className={cn("relative", className)}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {type === "line" && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}
        {type === "bar" && (
          <>
            {data.map((value, index) => {
              const barHeight = ((value - min) / range) * height;
              const barWidth = width / data.length * 0.6;
              const x = (index * width) / data.length + (width / data.length - barWidth) / 2;
              const y = height - barHeight;
              
              return (
                <rect
                  key={index}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  className="transition-all duration-300"
                />
              );
            })}
          </>
        )}
        {type === "sparkline" && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}
      </svg>
      {showTrend && (
        <div className="absolute top-0 right-0 text-xs">
          <span className={cn(
            "font-medium",
            trendPercentage > 0 ? "text-green-600" : 
            trendPercentage < 0 ? "text-red-600" : 
            "text-muted-foreground"
          )}>
            {trendPercentage > 0 ? "+" : ""}{trendPercentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface OriginDonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  className?: string;
}

export function OriginDonutChart({
  data,
  size = 60,
  className
}: OriginDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - 8) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 6;

  let cumulativePercentage = 0;

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
          
          const startAngleRad = (startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (endAngle - 90) * (Math.PI / 180);
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          cumulativePercentage += percentage;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-bold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  );
}
