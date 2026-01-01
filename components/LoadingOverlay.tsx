
import React from 'react';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 border-4 border-yellow-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-2 border-b-red-600 rounded-full animate-reverse-spin opacity-50"></div>
      </div>
      <h2 className="text-4xl font-heading mb-4 text-yellow-500 tracking-tighter glow-gold">{message}</h2>
      <p className="text-gray-500 max-w-xs animate-pulse font-mono text-xs uppercase tracking-[0.2em]">
        System syncing 808s and rendering visual frames...
      </p>
      
      <style>{`
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
