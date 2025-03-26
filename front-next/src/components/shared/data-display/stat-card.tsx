import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon | React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  } | 'neutral' | 'positive' | 'negative';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && typeof trend !== 'string' && (
              <p className={cn(
                "text-xs font-medium mt-2 flex items-center",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
                <span className="text-muted-foreground ml-1">desde o último mês</span>
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            {React.isValidElement(icon) ? (
              icon
            ) : typeof icon === "function" ? (
              React.createElement(icon as React.ComponentType<{ className?: string }>, { className: "h-5 w-5 text-primary" })
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}