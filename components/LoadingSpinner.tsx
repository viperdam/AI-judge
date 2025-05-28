
import React from 'react';

interface LoadingSpinnerProps {
  loadingText?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loadingText }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 my-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500"></div>
      <p className="text-slate-400 text-lg">{loadingText || 'Loading...'}</p>
    </div>
  );
};
