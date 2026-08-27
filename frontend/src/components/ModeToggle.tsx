import { motion } from "framer-motion";

interface ModeToggleProps {
  value: "live" | "replay";
  onChange: (mode: "live" | "replay") => void;
}

const OPTIONS: { label: string; value: "live" | "replay" }[] = [
  { label: "Live", value: "live" },
  { label: "Replay", value: "replay" },
];

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div
      className="relative bg-gray-800 rounded-full p-1 flex items-center gap-1"
      role="group"
      aria-label="Mode selection"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`relative z-10 px-4 py-1.5 text-sm rounded-full transition-colors ${
              isActive ? "text-white font-semibold" : "text-gray-400"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="mode-toggle-indicator"
                className="bg-cyan-500 rounded-full absolute inset-y-1 inset-x-0"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
