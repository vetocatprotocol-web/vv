'use client';

import * as React from 'react';

type WorkCardProps = {
  title: string;
  progress: number;
  status: string;
  updatedAt: string;
};

export default function WorkCard({ title, progress, status, updatedAt }: WorkCardProps) {
  return (
    <div className="rounded-xl border border-karyo-border bg-[#111827] p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-karyo-text-secondary">Status: {status}</p>
      <div className="mt-3 h-2 w-full rounded-full bg-[#1f2937]">
        <div className="h-2 rounded-full bg-karyo-cyan" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-karyo-text-secondary">{progress}% • Terakhir: {updatedAt}</p>
    </div>
  );
}
