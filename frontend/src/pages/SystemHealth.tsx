import { BotHealthPanel } from "@/components/BotHealthPanel/BotHealthPanel";
import { ThroughputChart } from "@/charts/ThroughputChart";
import { ModeToggle } from "@/components/ModeToggle";

export function SystemHealth() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">System Health</h1>
        <ModeToggle />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ThroughputChart />
        <BotHealthPanel />
      </div>
    </div>
  );
}