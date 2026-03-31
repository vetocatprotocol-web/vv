'use client';

import React from 'react';
import { useAIWorkspace, AIMode } from '@/lib/store';

interface ModeSwitcherProps {
  className?: string;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ className = '' }) => {
  const { selectedMode, setSelectedMode } = useAIWorkspace();

  const modes: { key: AIMode; label: string; description: string; icon: string }[] = [
    {
      key: 'manual',
      label: 'Manual',
      description: 'Full control, no AI assistance',
      icon: '👤',
    },
    {
      key: 'assist',
      label: 'Assist',
      description: 'AI helps with suggestions',
      icon: '🤝',
    },
    {
      key: 'auto',
      label: 'Auto',
      description: 'AI handles everything autonomously',
      icon: '🚀',
    },
  ];

  return (
    <div className={`bg-karyo-gray rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-karyo-text mb-3">AI Mode</h3>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setSelectedMode(mode.key)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left ${
              selectedMode === mode.key
                ? 'border-karyo-cyan bg-karyo-cyan/10 text-karyo-cyan'
                : 'border-karyo-gray-light bg-karyo-darker text-karyo-text-secondary hover:border-karyo-gray-light hover:bg-karyo-gray-light/50'
            }`}
          >
            <div className="text-lg mb-1">{mode.icon}</div>
            <div className="text-xs font-medium">{mode.label}</div>
            <div className="text-xs opacity-70 mt-1 leading-tight">
              {mode.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSwitcher;