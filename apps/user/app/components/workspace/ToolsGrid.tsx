'use client';

import * as React from 'react';

type ToolItem = {
  name: string;
  status: 'Connected' | 'Hubungkan';
  icon: string;
};

const tools: ToolItem[] = [
  { name: 'Google Drive', status: 'Connected', icon: '🟢' },
  { name: 'Slack', status: 'Hubungkan', icon: '💬' },
  { name: 'Gmail', status: 'Connected', icon: '✉️' },
  { name: 'Dropbox', status: 'Hubungkan', icon: '📦' },
  { name: 'Figma', status: 'Connected', icon: '🎨' },
];

export default function ToolsGrid() {
  return (
    <div className="rounded-xl border border-karyo-border bg-[#111827] p-4">
      <h3 className="text-lg font-semibold text-white">Tools Tersedia</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <div key={tool.name} className="rounded-lg border border-karyo-border bg-[#0f172a] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{tool.icon}</span>
                <span className="font-medium text-white">{tool.name}</span>
              </div>
              <span className={`text-xs font-semibold ${tool.status === 'Connected' ? 'text-green-300' : 'text-karyo-text-secondary'}`}>
                {tool.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
