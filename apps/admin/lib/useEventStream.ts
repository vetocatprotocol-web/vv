import * as React from 'react';
import { fetchEvents } from './api';

export type EventItem = {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
};

const SSE_URL = '/api/events/stream';

export function useEventStream() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadEvents = React.useCallback(async () => {
    try {
      const initial = await fetchEvents();
      setEvents(Array.isArray(initial) ? initial : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  React.useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      setRunning(true);
      setError(null);

      await loadEvents();

      source = new EventSource(SSE_URL);

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const normalized: EventItem = {
            id: parsed.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: parsed.type,
            payload: parsed.payload,
            createdAt: new Date(parsed.metadata?.timestamp || Date.now()).toISOString(),
          };

          setEvents((prev) => [normalized, ...prev].slice(0, 500));
        } catch (e) {
          console.error('[useEventStream] invalid SSE message', e);
        }
      };

      source.onerror = () => {
        setError('Event stream disconnected, reconnecting...');
        source?.close();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    void connect();

    return () => {
      if (source) source.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setRunning(false);
    };
  }, [loadEvents]);

  return {
    events,
    running,
    error,
    reload: loadEvents,
  };
}
