import React from "react";

export interface DepartmentHeaderProps {
  title: string;
  subtitle: string;
}

export function DepartmentHeader({ title, subtitle }: DepartmentHeaderProps) {
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
