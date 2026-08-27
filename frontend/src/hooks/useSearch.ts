import { useState, useEffect } from "react";
import type { Alert } from "../types/alert";

/**
 * Debounces a search query at 300ms and filters alerts against
 * id, type, sourceIp, destinationIp, and description fields (case-insensitive).
 *
 * When the query is empty all alerts are returned unfiltered.
 * Requirements: 1.8
 */
function useSearch(
  alerts: Alert[],
  query: string
): { filteredAlerts: Alert[]; debouncedQuery: string } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [query]);

  const filteredAlerts =
    debouncedQuery.trim() === ""
      ? alerts
      : alerts.filter((alert) => {
          const q = debouncedQuery.toLowerCase();
          return (
            alert.id.toLowerCase().includes(q) ||
            alert.type.toLowerCase().includes(q) ||
            alert.sourceIp.toLowerCase().includes(q) ||
            alert.destinationIp.toLowerCase().includes(q) ||
            alert.description.toLowerCase().includes(q)
          );
        });

  return { filteredAlerts, debouncedQuery };
}

export default useSearch;
