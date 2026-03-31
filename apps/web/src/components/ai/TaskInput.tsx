'use client';

import React, { useState, useRef } from 'react';
import { useAIWorkspace } from '@/lib/store';
import ModeSwitcher from './ModeSwitcher';

interface TaskInputProps {
  onSubmit?: (command: string, mode: string, goal?: string, data?: string) => void;
  className?: string;
}

const TaskInput: React.FC<TaskInputProps> = ({ onSubmit, className = '' }) => {
  const { selectedMode, startExecution, isExecuting } = useAIWorkspace();
  const [command, setCommand] = useState('');
  const [goal, setGoal] = useState('');
  const [data, setData] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isExecuting) return;

    // Start execution in the store
    startExecution(command, selectedMode, goal, data);

    // Call external onSubmit if provided
    if (onSubmit) {
      onSubmit(command, selectedMode, goal, data);
    }

    // Reset form
    setCommand('');
    setGoal('');
    setData('');
    setShowAdvanced(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // For now, just set the first file name as data
      setData(files[0].name);
    }
  };

  return (
    <div className={`bg-karyo-gray rounded-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Command Input */}
        <div className="relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Describe what you want to accomplish..."
            className="w-full bg-karyo-darker border border-karyo-gray-light rounded-lg px-4 py-3 text-karyo-text placeholder-karyo-text-secondary focus:outline-none focus:ring-2 focus:ring-karyo-cyan focus:border-karyo-cyan"
            disabled={isExecuting}
          />
          <div className="absolute right-3 top-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-karyo-text-secondary hover:text-karyo-cyan transition-colors"
              title="Attach file"
            >
              📎
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-karyo-text-secondary hover:text-karyo-cyan transition-colors"
              title="Advanced options"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-3 animate-slide-in">
            <div>
              <label className="block text-sm font-medium text-karyo-text mb-1">
                Goal (Optional)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What is the main objective?"
                className="w-full bg-karyo-darker border border-karyo-gray-light rounded-lg px-3 py-2 text-karyo-text placeholder-karyo-text-secondary focus:outline-none focus:ring-2 focus:ring-karyo-cyan focus:border-karyo-cyan"
                disabled={isExecuting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-karyo-text mb-1">
                Data/Context (Optional)
              </label>
              <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Provide additional context, data, or file information..."
                rows={3}
                className="w-full bg-karyo-darker border border-karyo-gray-light rounded-lg px-3 py-2 text-karyo-text placeholder-karyo-text-secondary focus:outline-none focus:ring-2 focus:ring-karyo-cyan focus:border-karyo-cyan resize-none"
                disabled={isExecuting}
              />
            </div>
          </div>
        )}

        {/* Mode Switcher */}
        <ModeSwitcher />

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!command.trim() || isExecuting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            command.trim() && !isExecuting
              ? 'bg-karyo-cyan hover:bg-karyo-cyan-dark text-karyo-dark shadow-lg hover:shadow-xl'
              : 'bg-karyo-gray-light text-karyo-text-secondary cursor-not-allowed'
          }`}
        >
          {isExecuting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-pulse-cyan w-4 h-4 bg-karyo-cyan rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Execute in ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode`
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskInput;