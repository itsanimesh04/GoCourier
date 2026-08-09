import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ReactNode;
  trend?: "up" | "down";
  color?: "blue" | "white";
  chartData?: number[];
  subtitle?: string;
  isActive?: boolean;
  // dynamic progress bar props (only used when color="blue")
  progressPercent?: number; // 0–100
  todayCount?: number;      // raw "X today" label
}

const StatsCard = ({
  title,
  value,
  change,
  icon,
  trend = "up",
  color = "white",
  chartData,
  subtitle,
  isActive = true,
  progressPercent = 0,
  todayCount,
}: StatsCardProps) => {
  const isBlue = color === "blue";

  return (
    <div
      className={`${
        isBlue
          ? "bg-linear-to-br from-blue-600 to-blue-700 text-white"
          : "bg-white"
      } rounded-2xl p-6 shadow-sm border ${
        isBlue ? "border-blue-600" : "border-gray-100"
      } relative overflow-hidden ${isActive ? "" : "opacity-50"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isBlue ? "bg-white/20" : "bg-gray-100"
            }`}
          >
            <span className={isBlue ? "text-white" : "text-gray-600"}>
              {icon}
            </span>
          </div>
          <span
            className={`text-sm font-medium ${
              isBlue ? "text-white/90" : "text-gray-600"
            }`}
          >
            {title}
          </span>
        </div>
        <button
          className={`p-1 rounded-lg hover:bg-gray-100 transition-colors ${
            isBlue ? "text-white/90 hover:bg-white/20" : "text-gray-400"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            <circle cx="10" cy="4" r="1.5" fill="currentColor" />
            <circle cx="10" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Value */}
      <div className="mb-3">
        <h3
          className={`text-3xl font-bold ${
            isBlue ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </h3>
        {subtitle && (
          <p
            className={`text-sm mt-1 ${
              isBlue ? "text-white/70" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Change Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isBlue
              ? "bg-white/20 text-white"
              : trend === "up"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {trend === "up" ? "↑" : "↓"} {change}
        </span>
        {subtitle && !isBlue && (
          <span className="text-sm text-gray-600">{subtitle}</span>
        )}
      </div>

      {/* Dynamic Progress Bar (blue card only) */}
      {isBlue && (
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-white/90 mt-2">
            {todayCount !== undefined
              ? `${todayCount} today`
              : progressPercent > 0
              ? `${progressPercent}% of daily avg`
              : "None today"}
          </p>
        </div>
      )}

      {/* Mini Chart (white cards with chartData) */}
      {chartData && !isBlue && (
        <div className="mt-4 flex items-end gap-1 h-12">
          {chartData.map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-100 rounded-t transition-all hover:bg-blue-200"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsCard;