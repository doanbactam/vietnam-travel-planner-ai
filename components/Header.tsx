
import React from 'react';
import { LoadingIcon } from './LoadingIcon'; // Kept in case of future loading states

interface HeaderProps {
  onShowHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowHistory }) => {
  return (
    <header className="w-full p-6 text-center" role="banner">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-3 mb-4 sm:mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 sm:w-12 sm:h-12 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21V3m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9M3.284 15.447A9.002 9.002 0 0 1 12 3c2.976 0 5.594 1.406 7.26 3.553M3.284 15.447c-.742 1.532-1.284 3.183-1.284 4.803 0 1.296.262 2.528.726 3.647m18.016-4.803c.742 1.532 1.284 3.183 1.284 4.803 0 1.296-.262 2.528-.726 3.647M12 9a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
          </svg>
          <div className="text-left sm:text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
              Vietnam Travel Planner <span className="text-teal-300">AI</span>
            </h1>
            <p className="text-white/80 mt-1 text-xs sm:text-sm">
              Kế hoạch du lịch Việt Nam với AI.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onShowHistory}
            className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-sky-500/90 rounded-lg shadow-sm hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-700 focus:ring-white"
          >
            Lịch sử Kế hoạch
          </button>
        </div>
      </div>
    </header>
  );
};