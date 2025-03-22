import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
      <div className="container px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p 
          className="text-muted-foreground mt-2"
          data-testid={subtitle ? undefined : "empty-subtitle"}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
