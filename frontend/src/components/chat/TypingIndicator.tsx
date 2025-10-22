import React from 'react';

interface TypingIndicatorProps {
  name?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ name }) => {
  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-[70%]">
        <div className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {name || 'Alguém'} está digitando
            </span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
