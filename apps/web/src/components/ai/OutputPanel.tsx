'use client';

import React, { useState } from 'react';
import { useAIWorkspace } from '@/lib/store';

interface OutputPanelProps {
  className?: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ className = '' }) => {
  const { results, currentTask, clearResults, isExecuting } = useAIWorkspace();
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const handleEdit = (resultId: string, content: string) => {
    setEditingResult(resultId);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    // In a real implementation, this would update the result in the store
    console.log('Saving edited content:', editedContent);
    setEditingResult(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingResult(null);
    setEditedContent('');
  };

  const handleRerun = () => {
    // In a real implementation, this would trigger a rerun of the current task
    console.log('Rerunning task:', currentTask.id);
  };

  const handleImprove = () => {
    // In a real implementation, this would trigger an improvement of the current result
    console.log('Improving result');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'file':
        return '📄';
      case 'data':
        return '📊';
      case 'analysis':
        return '🔍';
      default:
        return '📋';
    }
  };

  if (results.length === 0 && !isExecuting) {
    return (
      <div className={`bg-karyo-gray rounded-lg p-6 text-center ${className}`}>
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-medium text-karyo-text mb-2">
          Ready for AI Execution
        </h3>
        <p className="text-karyo-text-secondary">
          Submit a task above to see AI-generated results here
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-karyo-gray rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-karyo-text">
          AI Results
        </h3>
        {results.length > 0 && (
          <button
            onClick={clearResults}
            className="text-sm text-karyo-text-secondary hover:text-karyo-cyan transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Current task status */}
      {isExecuting && (
        <div className="mb-4 p-3 bg-karyo-cyan/10 border border-karyo-cyan/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse-cyan w-4 h-4 bg-karyo-cyan rounded-full"></div>
            <span className="text-karyo-cyan font-medium">Processing your request...</span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-karyo-darker rounded-lg p-4 border border-karyo-gray-light"
          >
            {/* Result header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getResultIcon(result.type)}</span>
                <span className="text-sm font-medium text-karyo-text capitalize">
                  {result.type} Result
                </span>
                <span className="text-xs text-karyo-text-secondary">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(result.id, result.content)}
                  className="text-karyo-text-secondary hover:text-karyo-cyan transition-colors text-sm"
                  title="Edit result"
                >
                  ✏️
                </button>
                <button
                  onClick={handleRerun}
                  className="text-karyo-text-secondary hover:text-karyo-cyan transition-colors text-sm"
                  title="Rerun task"
                >
                  🔄
                </button>
                <button
                  onClick={handleImprove}
                  className="text-karyo-text-secondary hover:text-karyo-cyan transition-colors text-sm"
                  title="Improve result"
                >
                  ✨
                </button>
              </div>
            </div>

            {/* Result content */}
            {editingResult === result.id ? (
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-karyo-gray border border-karyo-gray-light rounded-lg px-3 py-2 text-karyo-text placeholder-karyo-text-secondary focus:outline-none focus:ring-2 focus:ring-karyo-cyan focus:border-karyo-cyan resize-none"
                  rows={6}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="karyo-button-primary text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="karyo-button-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-karyo-text whitespace-pre-wrap font-mono text-sm bg-karyo-gray p-3 rounded overflow-x-auto">
                {result.content}
              </div>
            )}

            {/* Metadata */}
            {result.metadata && Object.keys(result.metadata).length > 0 && (
              <div className="mt-3 pt-3 border-t border-karyo-gray-light">
                <div className="text-xs text-karyo-text-secondary">
                  <strong>Metadata:</strong>
                  <pre className="mt-1 text-xs">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state when executing */}
      {results.length === 0 && isExecuting && (
        <div className="text-center py-8">
          <div className="animate-pulse-cyan text-4xl mb-4">🤖</div>
          <p className="text-karyo-text-secondary">
            AI is working on your request...
          </p>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;