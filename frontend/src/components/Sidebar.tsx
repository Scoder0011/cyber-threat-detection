const items = [["Overview", "⌂", "/"], ["Live Traffic", "⌁", "/live-traffic"], ["Alerts", "!", "/alerts"], ["Bots", "◉", "/bots"], ["Blockchain Verification", "◇", "/blockchain"], ["Settings", "⚙", "/settings"]] as const;

export function Sidebar({ active, onSelect }: { active: string; onSelect: (path: string) => void }) {
  return <aside className="group sticky top-0 flex h-screen w-[72px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 transition-all hover:w-60 dark:border-slate-800 dark:bg-slate-950 md:w-60">
    <div className="mb-9 flex items-center gap-3 overflow-hidden px-1"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-500 font-bold text-slate-950">T</span><span className="whitespace-nowrap font-semibold tracking-tight text-slate-900 dark:text-white">ThreatLens</span></div>
    <nav className="space-y-1">{items.map(([label, icon, path]) => <button key={label} onClick={() => onSelect(path)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${active === path ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"}`}><span className="w-4 text-center font-mono">{icon}</span><span className="hidden whitespace-nowrap group-hover:block md:block">{label}</span></button>)}</nav>
    <div className="mt-auto hidden rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-500 dark:text-slate-400 md:block"><span className="mb-1 block text-cyan-600 dark:text-cyan-300">● Protection active</span>All sensors online</div>
  </aside>;
}
