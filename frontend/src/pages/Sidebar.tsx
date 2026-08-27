import { NavLink } from "react-router-dom";
import clsx from "clsx";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/system", label: "System Health" },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-hairline bg-panel">
      <div className="border-b border-hairline px-5 py-4">
        <p className="font-display text-lg font-bold tracking-tight text-ink">
          THREAT<span className="text-flow">LENS</span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          fusion console
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              clsx(
                "block rounded px-3 py-2 font-mono text-xs transition-colors",
                isActive ? "bg-flow/10 text-flow" : "text-dim hover:bg-panel2 hover:text-ink"
              )
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}