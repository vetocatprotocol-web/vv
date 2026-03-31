'use client';

import * as React from 'react';

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { id: 'all-files', label: 'All Files', icon: '📁' },
  { id: 'documents', label: 'Documents', icon: '📝' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'ai-files', label: 'AI Files', icon: '🤖' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
  { id: 'trash', label: 'Trash', icon: '🗑️' },
  { id: 'ai-memory', label: 'AI Memory', icon: '🧠' },
];

export default function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void; }) {
  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-karyo-panel border-r border-karyo-border p-4 flex flex-col gap-6 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-2xl font-bold text-white">Karyo</h1>
          <span className="text-sm text-karyo-text-secondary">Workspace</span>
        </div>
        <div className="rounded-lg bg-karyo-dark p-3 border border-karyo-border">
          <p className="text-xs text-karyo-text-secondary">Mode</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="rounded bg-karyo-border px-2 py-1 text-xs">Workspace</button>
            <button className="rounded bg-karyo-dark px-2 py-1 text-xs">File</button>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${active === item.id ? 'bg-karyo-blue text-white' : 'text-karyo-text-secondary hover:bg-karyo-border hover:text-white'}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-xl bg-karyo-dark p-3 border border-karyo-border">
        <p className="text-xs text-karyo-text-secondary uppercase">Storage</p>
        <p className="text-sm font-medium mt-1">12 GB / 50 GB</p>
        <div className="mt-2 h-2 w-full rounded-full bg-[#1f2937]">
          <div className="h-2 w-[24%] rounded-full bg-karyo-cyan" />
        </div>
      </div>

      <button className="mt-auto rounded bg-karyo-cyan px-3 py-2 font-semibold text-black hover:bg-cyan-300">New Analysis</button>
    </aside>
  );
}
