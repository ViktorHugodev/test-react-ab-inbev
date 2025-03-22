import React from "react";

export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="bg-primary py-16">
      <div className="container px-6">
        <h1 className="text-4xl font-semibold text-primary-foreground mb-4">
          {title}
        </h1>
        <p className="text-primary-foreground/80">
          {subtitle}
        </p>
      </div>
    </div>
  );
}