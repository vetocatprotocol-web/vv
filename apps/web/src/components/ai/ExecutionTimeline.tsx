'use client';

import React, { useEffect, useRef } from 'react';
import { useAIWorkspace } from '@/lib/store';

interface ExecutionTimelineProps {
  className?: string;
}

const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ className = '' }) => {
  const { executionSteps, showTimeline, currentTask } = useAIWorkspace();
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineRef.current && executionSteps.length > 0) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [executionSteps]);

  if (!showTimeline || executionSteps.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '⚡';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-karyo-text-secondary';
      case 'running':
        return 'text-karyo-cyan animate-pulse-cyan';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-karyo-text-secondary';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`bg-karyo-gray rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-karyo-text">
          Execution Timeline
        </h3>
        <div className="text-sm text-karyo-text-secondary">
          Task: {currentTask.id ? currentTask.id.slice(-8) : 'N/A'}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="max-h-96 overflow-y-auto space-y-3"
      >
        {executionSteps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start space-x-3 p-3 bg-karyo-darker rounded-lg border border-karyo-gray-light"
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`text-lg ${getStatusColor(step.status)}`}>
                {getStatusIcon(step.status)}
              </div>
              {index < executionSteps.length - 1 && (
                <div className="w-px h-8 bg-karyo-gray-light mt-2"></div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-karyo-text truncate">
                  {step.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-karyo-text-secondary">
                  {step.duration && (
                    <span>{formatDuration(step.duration)}</span>
                  )}
                  <span>{step.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>

              <p className="text-sm text-karyo-text-secondary mt-1">
                {step.description}
              </p>

              {/* Output/Error display */}
              {step.output && (
                <div className="mt-2 p-2 bg-karyo-gray rounded text-xs text-karyo-text font-mono overflow-x-auto">
                  {step.output}
                </div>
              )}

              {step.error && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                  Error: {step.error}
                </div>
              )}

              {/* Progress indicator for running steps */}
              {step.status === 'running' && (
                <div className="mt-2">
                  <div className="w-full bg-karyo-gray-light rounded-full h-1">
                    <div className="bg-karyo-cyan h-1 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {executionSteps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-karyo-gray-light">
          <div className="flex justify-between text-sm text-karyo-text-secondary">
            <span>
              Steps: {executionSteps.filter(s => s.status === 'completed').length}/{executionSteps.length}
            </span>
            <span>
              Status: {currentTask.status === 'processing' ? 'Running' :
                      currentTask.status === 'completed' ? 'Completed' :
                      currentTask.status === 'error' ? 'Failed' : 'Idle'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionTimeline;