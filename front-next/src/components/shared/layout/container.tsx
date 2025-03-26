import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({
  children,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6 lg:px-8",
        {
          "max-w-7xl": size === "default",
          "max-w-5xl": size === "sm",
          "max-w-6xl": size === "md",
          "max-w-[84rem]": size === "lg",
          "max-w-[90rem]": size === "xl",
          "max-w-none": size === "full",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}