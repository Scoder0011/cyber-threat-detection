import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Alert } from "@/types/alert";

export function ThreatClassChart({ alerts }: { alerts: Alert[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => a.threat_classes.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [alerts]);

  return (
    <div className="rounded-lg border border-hairline bg-panel p-4">
      <h3 className="mb-2 font-display text-sm font-semibold tracking-wide text-ink">
        Threat Class Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#7A8FA6"
            tick={{ fontSize: 9, fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: "#232838" }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis stroke="#7A8FA6" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#171C28",
              border: "1px solid #232838",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill="#FF9F43" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}