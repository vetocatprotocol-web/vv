"use client";

import * as React from 'react';
import { postEvent } from '../../lib/api';

export default function AIControlPanel({ onUpdate }: { onUpdate?: () => void }) {
  const [provider, setProvider] = React.useState('openai');
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxTokens, setMaxTokens] = React.useState(256);
  const [status, setStatus] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');

    try {
      await postEvent({
        type: 'AI_CONFIG_UPDATE',
        payload: { provider, temperature, maxTokens },
      });
      setStatus('updated');
      onUpdate?.();
    } catch (err) {
      setStatus(`error: ${(err as Error).message}`);
    }
  };

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">AI Control</h2>
      <p className="text-sm text-slate-500 mb-4">Configure provider and parameters through events.</p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Provider</label>
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="mock">Mock</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Temperature</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            className="mt-1 w-full rounded border px-2 py-1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Max Tokens</label>
          <input
            type="number"
            min="1"
            className="mt-1 w-full rounded border px-2 py-1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
          Apply AI Config
        </button>

        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </section>
  );
}
