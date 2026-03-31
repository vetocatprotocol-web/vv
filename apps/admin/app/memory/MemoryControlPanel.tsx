"use client";

import * as React from 'react';
import { postEvent } from '../../lib/api';

export default function MemoryControlPanel({ onDone }: { onDone?: () => void }) {
  const [key, setKey] = React.useState('');
  const [value, setValue] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);

  const send = async (type: string, payload: any) => {
    setStatus('sending');
    try {
      await postEvent({ type, payload });
      setStatus('sent');
      onDone?.();
    } catch (err) {
      setStatus(`error: ${(err as Error).message}`);
    }
  };

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Memory Control</h2>
      <p className="text-sm text-slate-500 mb-4">Read/write/delete memory through listeners.</p>

      <div className="grid grid-cols-1 gap-3">
        <input
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="rounded border px-2 py-1"
        />

        <input
          placeholder="Value (JSON)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded border px-2 py-1"
        />

        <div className="flex gap-2">
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            onClick={() => {
              let parsed;
              try {
                parsed = JSON.parse(value);
              } catch {
                parsed = value;
              }
              void send('MEMORY_WRITE', { key, value: parsed });
            }}
          >
            Write
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            onClick={() => void send('MEMORY_READ', { key })}
          >
            Read
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-2 text-white hover:bg-rose-700"
            onClick={() => void send('MEMORY_DELETE', { key })}
          >
            Delete
          </button>
        </div>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </div>
    </section>
  );
}
