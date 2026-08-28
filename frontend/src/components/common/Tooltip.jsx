import React, { useState } from "react";

export const Tooltip = ({
  content,
  children,
  position = "top", // 'top' | 'bottom' | 'left' | 'right'
  delay = 200,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  if (!content) return children;

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-lg whitespace-nowrap bg-slate-900/95 dark:bg-slate-800/95 text-slate-100 dark:text-slate-200 border border-slate-700/60 dark:border-slate-600/60 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
