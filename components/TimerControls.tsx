'use client';

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isRunning: boolean;
  isPaused: boolean;
  hasTimer: boolean;
}

export default function TimerControls({
  onStart,
  onPause,
  onResume,
  onReset,
  isRunning,
  isPaused,
  hasTimer,
}: TimerControlsProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {!hasTimer && (
        <button
          onClick={onStart}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          시작
        </button>
      )}
      
      {hasTimer && isRunning && !isPaused && (
        <button
          onClick={onPause}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          일시중지
        </button>
      )}
      
      {hasTimer && isPaused && (
        <button
          onClick={onResume}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          재개
        </button>
      )}
      
      {hasTimer && (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          초기화
        </button>
      )}
    </div>
  );
}


