import React from "react";
import { LazyRechartsComponents } from "@/components/optimized/LazyComponents";

interface ChartWrapperProps {
  children: React.ReactNode;
  /** optional dark background flag */
  dark?: boolean;
  className?: string;
}

/**
 * Wrapper that ensures charts inherit brand colors and responsive layout.
 * Use in place of direct <ResponsiveContainer>.
 */
export function ChartWrapper({ children, dark = false, className }: ChartWrapperProps) {
  const { ResponsiveContainer: LazyResponsiveContainer } = LazyRechartsComponents;
  return (
    <div className={className + " w-full h-full"} style={{ color: "hsl(var(--foreground))" }}>
      <LazyResponsiveContainer width="100%" height="100%">
        {children}
      </LazyResponsiveContainer>
    </div>
  );
} 