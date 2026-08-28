import React from "react";

export const Badge = ({
  children,
  variant = "default", // 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'default'
  size = "md", // 'sm' | 'md'
  dot = false,
  className = "",
}) => {
  const variantStyles = {
    critical: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60",
    high: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/60",
    medium: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60",
    low: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/60",
    success: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60",
    info: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/60",
    default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  const dotColors = {
    critical: "bg-rose-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
    success: "bg-emerald-500",
    info: "bg-sky-500",
    default: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-[11px]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-tight rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
};
