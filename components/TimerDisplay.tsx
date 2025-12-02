'use client';

interface TimerDisplayProps {
  remainingSeconds: number;
  teamName?: string;
  isRunning?: boolean;
  isPaused?: boolean;
}

export default function TimerDisplay({ 
  remainingSeconds, 
  teamName,
  isRunning = false,
  isPaused = false 
}: TimerDisplayProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  const formatTime = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  const getStatusText = () => {
    if (!teamName) return '대기 중';
    if (isPaused) return '일시중지';
    if (isRunning) return '진행 중';
    if (remainingSeconds === 0) return '시간 종료';
    return '정지됨';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 px-4">
      <div className="relative w-full flex justify-center">
        {/* 디지털 시계 스타일 - 반응형 */}
        <div className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-mono font-bold leading-none text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
          <span className="tabular-nums">{formatTime(minutes)}</span>
          <span className="mx-2 md:mx-4 opacity-50">:</span>
          <span className="tabular-nums">{formatTime(seconds)}</span>
        </div>
        
        {/* LED 효과를 위한 글로우 */}
        <div className="absolute inset-0 flex justify-center text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-mono font-bold leading-none text-green-500 opacity-30 blur-xl pointer-events-none">
          <span className="tabular-nums">{formatTime(minutes)}</span>
          <span className="mx-2 md:mx-4 opacity-50">:</span>
          <span className="tabular-nums">{formatTime(seconds)}</span>
        </div>
      </div>
      
      <div className="mt-4 md:mt-8 text-lg md:text-2xl text-green-500 font-semibold">
        {getStatusText()}
      </div>
    </div>
  );
}

