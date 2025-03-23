import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsCard({ 
  title, 
  description, 
  icon, 
  children, 
  className 
}: SettingsCardProps) {
  return (
    <Card className={cn(
      "rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-none",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
