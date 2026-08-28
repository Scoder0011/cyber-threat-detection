export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <button onClick={onToggle} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" aria-label="Toggle colour theme">{dark ? "☀ Light" : "◐ Dark"}</button>;
}
