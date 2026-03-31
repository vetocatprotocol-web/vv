'use client';

import * as React from 'react';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import Hero from './components/workspace/Hero';
import CommandBar from './components/workspace/CommandBar';
import WorkCard from './components/workspace/WorkCard';
import ToolsGrid from './components/workspace/ToolsGrid';
import { useEventStream } from '../lib/useEventStream';
import { fetchEvents } from '../lib/api';

const initialTasks = [
  { title: 'Analisis Data Penjualan', progress: 80, status: 'In Progress', updatedAt: '10 menit lalu' },
  { title: 'Ringkas Dokumen Rencana', progress: 45, status: 'In Progress', updatedAt: '20 menit lalu' },
  { title: 'Set Up AI Memory', progress: 60, status: 'In Progress', updatedAt: '35 menit lalu' },
];

export default function HomePage() {
  const [activeNav, setActiveNav] = React.useState('all-files');
  const [selectedCommand, setSelectedCommand] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState('');
  const [agentOutput, setAgentOutput] = React.useState<string>('Belum ada hasil.');
  const [memoryHistory, setMemoryHistory] = React.useState<any[]>([]);

  const sessionStartedAt = React.useMemo(() => Date.now(), []);

  const { events, running, error, reload } = useEventStream();

  React.useEffect(() => {
    const lastResponse = events.find((event) => event.type === 'AGENT_RESPONSE' || event.type === 'AGENT_COMPLETED');
    if (lastResponse) {
      setAgentOutput(JSON.stringify(lastResponse.payload, null, 2));
    }

    const memoryEvents = events.filter((event) => event.type === 'MEMORY_WRITE' || event.type === 'MEMORY_DELETE');
    if (memoryEvents.length > 0) {
      setMemoryHistory(memoryEvents.map((event) => ({
        id: event.id,
        type: event.type,
        payload: event.payload,
        time: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
      })));
    }
  }, [events]);

  const handleQuickAction = (command: string) => {
    setSelectedCommand(command);
    setStatusMessage(`Quick action dipilih: ${command}`);
  };

  const handleCommandSubmit = async (text: string) => {
    setStatusMessage(`Mengirim perintah: "${text}"`);
    await reload();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={activeNav} onChange={setActiveNav} />

      <main className="flex-1 overflow-y-auto bg-[#0b1220] p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Karyo AI Workspace</h1>
          <div className="text-sm text-karyo-text-secondary">
            Real-time status: {running ? <span className="text-lime-300">Online</span> : <span className="text-rose-400">Offline</span>}
            {error ? <span className="ml-3 text-amber-400">{error}</span> : null}
          </div>
        </div>

        <Hero onQuickAction={handleQuickAction} />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <CommandBar
              placeholder="Ketik perintah, buat dokumen, atau olah file..."
              initial={selectedCommand}
              onSubmit={handleCommandSubmit}
              onStatus={setStatusMessage}
            />

            <section className="rounded-xl border border-karyo-border bg-[#111827] p-4">
              <h2 className="text-xl font-semibold text-white">Lanjutkan kerja Anda</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {initialTasks.map((task) => (
                  <WorkCard key={task.title} title={task.title} progress={task.progress} status={task.status} updatedAt={task.updatedAt} />
                ))}
              </div>
            </section>

            <ToolsGrid />

            <section className="rounded-xl border border-karyo-border bg-[#111827] p-4">
              <h2 className="text-xl font-semibold text-white">Output Agent Terbaru</h2>
              <pre className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-karyo-border bg-[#0f172a] p-3 text-sm text-karyo-text">{agentOutput}</pre>
            </section>

            <section className="rounded-xl border border-karyo-border bg-[#111827] p-4">
              <h2 className="text-xl font-semibold text-white">Memory History</h2>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-karyo-border bg-[#0f172a] p-3">
                {memoryHistory.length === 0 ? (
                  <p className="text-sm text-karyo-text-secondary">Belum ada riwayat memori.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-karyo-text">
                    {memoryHistory.map((item) => (
                      <li key={item.id}>
                        <strong>{item.time}</strong> {item.type} - {JSON.stringify(item.payload)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <section className="rounded-xl border border-karyo-border bg-[#111827] p-4">
                <h2 className="text-xl font-semibold text-white">Output / Event Feed</h2>
                <div className="mt-3 h-[45vh] overflow-y-auto rounded-lg border border-karyo-border bg-[#0f172a] p-3 scrollbar-thin">
                  {events.length === 0 ? (
                    <p className="text-sm text-karyo-text-secondary">Menunggu event...</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {events.slice(0, 20).map((event) => (
                        <li key={event.id} className="rounded-lg border border-karyo-border p-2 hover:bg-[#1f2937]">
                          <p className="text-xs text-karyo-text-secondary">{new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString()}</p>
                          <strong className="text-white">{event.type}</strong>
                          <div className="text-karyo-text-secondary text-xs break-words">{JSON.stringify(event.payload)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-karyo-border bg-[#111827] p-4">
                <h2 className="text-xl font-semibold text-white">Kondisi</h2>
                <p className="text-karyo-text-secondary mt-2">{statusMessage || 'Menunggu perintah...'}</p>
                <button
                  className="mt-3 rounded bg-karyo-cyan px-3 py-2 text-black"
                  onClick={() => void fetchEvents().then(() => reload())}
                >
                  Sinkron ulang
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>

      <RightPanel events={events} sessionStartedAt={sessionStartedAt} />
    </div>
  );
}
