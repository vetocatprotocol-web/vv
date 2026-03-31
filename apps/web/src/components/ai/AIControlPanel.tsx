'use client';

import React from 'react';
import { useAIWorkspace } from '@/lib/store';

interface AIControlPanelProps {
  className?: string;
}

const AIControlPanel: React.FC<AIControlPanelProps> = ({ className = '' }) => {
  const {
    agents,
    currentModel,
    totalCost,
    showLogs,
    toggleLogs,
    isExecuting,
    currentTask
  } = useAIWorkspace();

  const activeAgents = agents.filter(agent => agent.status !== 'idle');

  return (
    <div className={`bg-karyo-gray rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-karyo-text">
          AI Control Panel
        </h3>
        <button
          onClick={toggleLogs}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            showLogs
              ? 'bg-karyo-cyan text-karyo-dark'
              : 'bg-karyo-gray-light text-karyo-text-secondary hover:bg-karyo-gray'
          }`}
        >
          {showLogs ? 'Hide Logs' : 'Show Logs'}
        </button>
      </div>

      {/* Current Model */}
      <div className="mb-4">
        <div className="text-sm text-karyo-text-secondary mb-1">Current Model</div>
        <div className="flex items-center space-x-2">
          <div className="text-karyo-cyan font-medium">{currentModel}</div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Cost Estimation */}
      <div className="mb-4">
        <div className="text-sm text-karyo-text-secondary mb-1">Session Cost</div>
        <div className="text-lg font-semibold text-karyo-text">
          ${totalCost.toFixed(4)}
        </div>
      </div>

      {/* Active Agents */}
      <div className="mb-4">
        <div className="text-sm text-karyo-text-secondary mb-2">Active Agents</div>
        <div className="space-y-2">
          {activeAgents.length === 0 ? (
            <div className="text-karyo-text-secondary text-sm">No active agents</div>
          ) : (
            activeAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 bg-karyo-darker rounded"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400 animate-pulse' :
                    agent.status === 'busy' ? 'bg-karyo-cyan animate-pulse' :
                    'bg-red-400'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-karyo-text">
                      {agent.name}
                    </div>
                    <div className="text-xs text-karyo-text-secondary capitalize">
                      {agent.type}
                    </div>
                  </div>
                </div>
                {agent.cost && (
                  <div className="text-xs text-karyo-cyan">
                    ${agent.cost.toFixed(4)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Task Status */}
      {isExecuting && currentTask.id && (
        <div className="mb-4">
          <div className="text-sm text-karyo-text-secondary mb-2">Current Task</div>
          <div className="p-3 bg-karyo-darker rounded">
            <div className="text-sm text-karyo-text mb-1">
              {currentTask.command}
            </div>
            <div className="flex items-center space-x-2 text-xs text-karyo-text-secondary">
              <span className="capitalize">{currentTask.mode} mode</span>
              <span>•</span>
              <span>{currentTask.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Logs */}
      {showLogs && (
        <div className="border-t border-karyo-gray-light pt-4">
          <div className="text-sm text-karyo-text-secondary mb-2">System Logs</div>
          <div className="bg-karyo-darker rounded p-3 max-h-48 overflow-y-auto">
            <div className="space-y-1 text-xs font-mono">
              <div className="text-karyo-text-secondary">
                [INFO] AI Workspace initialized
              </div>
              <div className="text-karyo-text-secondary">
                [INFO] Model {currentModel} loaded
              </div>
              {agents.map(agent => (
                <div key={agent.id} className="text-karyo-text-secondary">
                  [INFO] Agent {agent.name} ({agent.type}) ready
                </div>
              ))}
              {isExecuting && (
                <div className="text-karyo-cyan">
                  [INFO] Task execution started: {currentTask.command}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIControlPanel;