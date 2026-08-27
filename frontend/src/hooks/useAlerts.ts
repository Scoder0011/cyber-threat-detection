import { useEffect, useRef, useState } from "react";
import { api, connectAlertsSocket } from "@/api/client";
import type { Alert } from "@/types/alert";

const MAX_ALERTS = 500;

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .listAlerts({ limit: 100 })
      .then((initial) => {
        if (mounted) setAlerts(initial);
      })
      .catch((err) => mounted && setError(String(err)))
      .finally(() => mounted && setLoading(false));

    socketRef.current = connectAlertsSocket(
      (incoming) => {
        setAlerts((prev) => [incoming, ...prev].slice(0, MAX_ALERTS));
      },
      (status) => setWsStatus(status)
    );

    return () => {
      mounted = false;
      socketRef.current?.close();
    };
  }, []);

  return { alerts, wsStatus, loading, error };
}