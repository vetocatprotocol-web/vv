"use client";

import * as React from 'react';
import { postEvent } from '../../lib/api';

export default function SystemConfigPanel({ onUpdate }: { onUpdate?: () => void }) {
  const [key, setKey] = React.useState('OPENAI_API_KEY');
  const [value, setValue] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');

    try {
      await postEvent({
        type: 'SYSTEM_CONFIG_UPDATE',
        payload: { key, value },
      });
      setStatus('saved');
      setValue('');
      onUpdate?.();
    } catch (err) {
      setStatus(`error: ${(err as Error).message}`);
    }
  }

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">System Configuration</h2>
      <p className="text-sm text-slate-500 mb-4">Update system settings via event dispatch.</p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Config Key</label>
          <input
            type="text"
            className="mt-1 w-full rounded border px-2 py-1"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Value</label>
          <input
            type="password"
            className="mt-1 w-full rounded border px-2 py-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Sensitive values will be masked"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Config (event)
        </button>

        {status && <p className="text-sm text-slate-600">Status: {status}</p>}
      </form>
    </section>
  );
}
