import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/api/client";
import type { ThroughputPoint } from "@/types/alert";

export function ThroughputChart() {
  const [data, setData] = useState<ThroughputPoint[]>([]);

  useEffect(() => {
    let mounted = true;
    const poll = () =>
      api
        .getThroughput(300)
        .then((d) => mounted && setData(d))
        .catch(() => {});
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-lg border border-hairline bg-panel p-4">
      <h3 className="mb-2 font-display text-sm font-semibold tracking-wide text-ink">
        Flow Throughput
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            tickFormatter={(t) => new Date(t).toLocaleTimeString().slice(0, 5)}
            stroke="#7A8FA6"
            tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: "#232838" }}
            tickLine={false}
          />
          <YAxis
            stroke="#7A8FA6"
            tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#171C28",
              border: "1px solid #232838",
              borderRadius: 6,
              fontFamily: "IBM Plex Mono",
              fontSize: 12,
            }}
            labelFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <Area
            type="monotone"
            dataKey="flows_per_sec"
            stroke="#5B8DEF"
            fill="url(#flowGradient)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}