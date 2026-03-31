"use client";

import * as React from 'react';
import { postEvent } from '../../lib/api';

export default function EventControlPanel({ onTrigger }: { onTrigger?: () => void }) {
  const [type, setType] = React.useState('CUSTOM_EVENT_TRIGGER');
  const [payload, setPayload] = React.useState('{ "message": "hello" }');
  const [status, setStatus] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(payload);
    } catch (e) {
      setStatus('Invalid JSON payload');
      return;
    }

    try {
      await postEvent({ type, payload: parsedPayload });
      setStatus('sent');
      onTrigger?.();
    } catch (err) {
      setStatus(`error: ${(err as Error).message}`);
    }
  };

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Event Control</h2>
      <p className="text-sm text-slate-500 mb-4">Send custom events through event bus.</p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Event Type</label>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
          />
        </div>

        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Trigger Event
        </button>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </section>
  );
}
