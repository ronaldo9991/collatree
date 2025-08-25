import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconBgColor?: string;
  iconTextColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "neutral",
  iconBgColor = "bg-blue-100",
  iconTextColor = "text-blue-600"
}: StatCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  }[changeType];

  return (
    <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`${iconTextColor} text-lg`} />
          </div>
          {change && (
            <span className={`text-xs px-2 py-1 rounded-full bg-opacity-20 ${changeColor} bg-current`}>
              {change}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </h3>
        <p className="text-gray-600 text-sm" data-testid={`stat-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </p>
      </CardContent>
    </Card>
  );
}
