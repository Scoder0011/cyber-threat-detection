import React from "react";
import { useTilt } from "../../hooks/useTilt";

export const Card = ({
  children,
  tilt = false,
  glass = false,
  glow = "none", // 'blue' | 'red' | 'orange' | 'green' | 'yellow' | 'none'
  className = "",
  onClick,
  ...props
}) => {
  const { ref, style, onMouseMove, onMouseLeave } = useTilt({
    maxTilt: 6,
    scale: 1.015,
  });

  const glowClasses = {
    blue: "hover:shadow-glow-blue dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
    red: "hover:shadow-glow-red dark:hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]",
    orange: "hover:shadow-glow-orange dark:hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]",
    green: "hover:shadow-glow-green dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    yellow: "hover:shadow-glow-yellow dark:hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]",
    none: "",
  };

  const glassClasses = glass
    ? "bg-white/80 dark:bg-[#1A1E27]/80 backdrop-blur-md"
    : "bg-white dark:bg-[#1A1E27]";

  return (
    <div
      ref={tilt ? ref : undefined}
      style={tilt ? style : undefined}
      onMouseMove={tilt ? onMouseMove : undefined}
      onMouseLeave={tilt ? onMouseLeave : undefined}
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-200 ${glassClasses} ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
