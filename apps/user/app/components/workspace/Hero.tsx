'use client';

import * as React from 'react';

type HeroProps = {
  onQuickAction: (command: string) => void;
};

const quickCommands = [
  { label: 'Buat Dokumen', command: 'Buat dokumen baru' },
  { label: 'Buat Laporan', command: 'Buat laporan ringkas' },
  { label: 'Upload & Olah File', command: 'Upload file dan olah data' },
  { label: 'Analisis Data', command: 'Analisis dataset' },
  { label: 'Ringkas File', command: 'Ringkas konten file' },
  { label: 'Rapikan File', command: 'Rapikan file dan folder' },
];

export default function Hero({ onQuickAction }: HeroProps) {
  return (
    <section className="rounded-2xl border border-karyo-border bg-[#111827] p-6 shadow-glow">
      <h2 className="text-3xl font-bold text-white">Mau mulai dari mana?</h2>
      <p className="text-karyo-text-secondary mt-1">Kontrol penuh lewat perintah. Eksekusi berjalan di background.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {quickCommands.map((item) => (
          <button
            key={item.label}
            className="rounded-lg border border-karyo-border bg-karyo-darker p-3 text-left transition hover:border-karyo-cyan hover:bg-[#1f2937]"
            onClick={() => onQuickAction(item.command)}
          >
            <p className="text-sm text-karyo-text-secondary">Quick Action</p>
            <p className="mt-1 font-semibold text-white">{item.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
