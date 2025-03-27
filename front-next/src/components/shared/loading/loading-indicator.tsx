"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  text?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * LoadingIndicator component
 * 
 * Um componente de loading que exibe um spinner e opcionalmente um texto.
 * Pode ser usado em tela cheia ou como parte de um componente.
 * Adapta-se automaticamente ao tema atual.
 */
function LoadingIndicator({
  text = "Carregando...",
  fullScreen = false,
  size = "md",
  className,
}: LoadingIndicatorProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-4";

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-2">
        <Spinner size={size} />
        {text && (
          <p className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

export { LoadingIndicator };
