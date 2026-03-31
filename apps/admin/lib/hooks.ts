"use client";

import * as React from "react";
import { fetchEvents } from "./api";

export function useEvents(pollInterval = 3000) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), pollInterval);
    return () => clearInterval(timer);
  }, [load, pollInterval]);

  return {
    events,
    loading,
    error,
    reload: load,
  };
}
