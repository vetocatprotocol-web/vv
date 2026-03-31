'use client';

import * as React from 'react';
import { postEvent } from '../../../lib/api';

type CommandBarProps = {
  placeholder?: string;
  initial?: string;
  onSubmit?: (text: string) => void;
  onStatus?: (status: string) => void;
};

export default function CommandBar({ placeholder = 'Ketik perintah, buat dokumen, atau olah file...', initial = '', onSubmit, onStatus }: CommandBarProps) {
  const [commandText, setCommandText] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCommandText(initial);
  }, [initial]);

  const submit = async () => {
    if (!commandText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await postEvent({
        type: 'USER_INPUT',
        payload: {
          userId: 'user-123',
          text: commandText.trim(),
        },
      });

      setCommandText('');
      onSubmit?.(commandText.trim());
      onStatus?.('Perintah dikirim');
    } catch (err) {
      setError((err as Error).message);
      onStatus?.(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-karyo-border bg-[#0f172a] p-4">
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-karyo-border bg-[#111827] px-3 py-2 text-white outline-none focus:border-karyo-cyan"
          placeholder={placeholder}
          value={commandText}
          onChange={(e: any) => setCommandText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-karyo-cyan px-4 text-black disabled:opacity-70"
        >
          {loading ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
