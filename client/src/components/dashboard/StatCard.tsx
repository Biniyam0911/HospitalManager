import { TrendingUp, TrendingDown, Users, Calendar, Hotel, DollarSign } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  trendDirection?: "up" | "down";
  subValue?: string;
  icon: "users" | "calendar" | "bed" | "currency";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  trendDirection = "up",
  subValue,
  icon,
}) => {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="h-6 w-6 text-primary" />;
      case "calendar":
        return <Calendar className="h-6 w-6 text-primary" />;
      case "bed":
        return <Hotel className="h-6 w-6 text-primary" />;
      case "currency":
        return <DollarSign className="h-6 w-6 text-primary" />;
      default:
        return <Users className="h-6 w-6 text-primary" />;
    }
  };

  const trendClass = trendDirection === "up" ? "text-secondary" : "text-alert";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
      <div className="flex justify-between">
        <div>
          <p className="text-midGrey text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold text-textDark mt-1">{value}</p>
          {trend !== undefined ? (
            <p className={`text-xs ${trendClass} flex items-center mt-1`}>
              {trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{`${trend > 0 ? "+" : ""}${trend}% ${trendLabel || ""}`}</span>
            </p>
          ) : (
            subValue && <p className="text-xs text-secondary mt-1">{subValue}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
