'use client';

import React from 'react';
import { useAIWorkspace } from '@/lib/store';

interface AgentStatusProps {
  className?: string;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ className = '' }) => {
  const { agents } = useAIWorkspace();

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'planner':
        return '🧠';
      case 'executor':
        return '⚡';
      case 'evaluator':
        return '📊';
      default:
        return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-karyo-text-secondary';
      case 'active':
        return 'text-green-400';
      case 'busy':
        return 'text-karyo-cyan animate-pulse';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-karyo-text-secondary';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-karyo-gray-light';
      case 'active':
        return 'bg-green-400/10 border-green-400/30';
      case 'busy':
        return 'bg-karyo-cyan/10 border-karyo-cyan/30';
      case 'error':
        return 'bg-red-400/10 border-red-400/30';
      default:
        return 'bg-karyo-gray-light';
    }
  };

  return (
    <div className={`bg-karyo-gray rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-karyo-text mb-4">
        Agent Status
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-3 rounded-lg border ${getStatusBg(agent.status)} transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getAgentIcon(agent.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-karyo-text">
                    {agent.name}
                  </div>
                  <div className="text-xs text-karyo-text-secondary capitalize">
                    {agent.type}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status.toUpperCase()}
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === 'active' ? 'bg-green-400' :
                  agent.status === 'busy' ? 'bg-karyo-cyan' :
                  agent.status === 'error' ? 'bg-red-400' :
                  'bg-karyo-text-secondary'
                } ${agent.status === 'busy' ? 'animate-pulse' : ''}`}></div>
              </div>
            </div>

            {/* Current task */}
            {agent.currentTask && (
              <div className="mt-2 pt-2 border-t border-karyo-gray-light">
                <div className="text-xs text-karyo-text-secondary">
                  Current: {agent.currentTask}
                </div>
              </div>
            )}

            {/* Model and cost info */}
            {(agent.model || agent.cost) && (
              <div className="mt-2 flex justify-between text-xs text-karyo-text-secondary">
                {agent.model && <span>Model: {agent.model}</span>}
                {agent.cost && <span>Cost: ${agent.cost.toFixed(4)}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-karyo-gray-light">
        <div className="flex justify-between text-sm text-karyo-text-secondary">
          <span>Active: {agents.filter(a => a.status === 'active' || a.status === 'busy').length}</span>
          <span>Total: {agents.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentStatus;