import React from "react";
import { ResponsiveContainer } from "recharts";

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
  return (
    <div className={className + " w-full h-full"} style={{ color: "hsl(var(--foreground))" }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
} 