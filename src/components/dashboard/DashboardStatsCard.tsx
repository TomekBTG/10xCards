import React from "react";

interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ title, value, trend, icon, onClick }) => {
  const trendColor = trend && trend > 0 ? "text-green-500" : "text-red-500";
  const trendIcon = trend && trend > 0 ? "↑" : "↓";

  return (
    <div
      className={`p-5 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-all duration-300 border border-zinc-800/50 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-zinc-400 font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {trend && (
            <div className={`text-sm ${trendColor} flex items-center gap-1`}>
              <span>{trendIcon}</span>
              <span>
                {Math.abs(trend)}% {trend > 0 ? "wzrost" : "spadek"}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-blue-500 rounded-full bg-blue-500/10 p-2">{icon}</div>}
      </div>
    </div>
  );
};

export default DashboardStatsCard;
