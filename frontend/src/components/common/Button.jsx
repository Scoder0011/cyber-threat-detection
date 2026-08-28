import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Tooltip } from "./Tooltip";

export const Button = ({
  children,
  variant = "primary", // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = "md", // 'sm' | 'md' | 'lg' | 'icon'
  icon = null,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  tooltip = null,
  tooltipPosition = "top",
  ariaLabel,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async (e) => {
    if (disabled || isLoading || internalLoading) return;
    if (onClick) {
      const result = onClick(e);
      // If onClick returns a Promise, handle automatic loading state
      if (result instanceof Promise) {
        setInternalLoading(true);
        try {
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  const loading = isLoading || internalLoading;

  // Variants styling
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/30 border border-blue-500/30",
    secondary:
      "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08]",
    outline:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 border border-rose-500/30",
  };

  // Sizes styling
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    md: "px-3.5 py-2 text-xs font-semibold gap-2 rounded-xl",
    lg: "px-4 py-2.5 text-sm font-semibold gap-2.5 rounded-xl",
    icon: "p-2 rounded-xl",
  };

  const buttonElement = (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || tooltip || (typeof children === "string" ? children : undefined)}
      className={`inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 select-none ${
        disabled || loading ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"
      } ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {size !== "icon" && <span>Processing...</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};
