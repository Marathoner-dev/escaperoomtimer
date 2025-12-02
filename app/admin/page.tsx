'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout, onAuthChange, isAdmin } from '@/lib/auth';
import { 
  subscribeToTimer, 
  initializeTimer, 
  pauseTimer, 
  resumeTimer, 
  resetTimer,
  stopTimer,
  subscribeToRecords,
  deleteRecord,
  TimerState,
  Record
} from '@/lib/firestore';
import TimerControls from '@/components/TimerControls';

const TIMER_DURATION = 15 * 60; // 15분

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const router = useRouter();

  // startTime 기반으로 remainingSeconds 계산하는 함수
  const calculateRemainingSeconds = (state: TimerState): number => {
    if (!state.startTime || !state.isRunning || state.isPaused) {
      return state.remainingSeconds;
    }
    
    const now = new Date();
    const startTime = state.startTime.toDate();
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const calculated = Math.max(0, TIMER_DURATION - elapsedSeconds);
    
    return calculated;
  };

  useEffect(() => {
    // 인증 상태 확인
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else if (!isAdmin(currentUser)) {
        // 관리자가 아니면 로그아웃하고 로그인 페이지로 리다이렉트
        logout();
        router.push('/admin/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // 타이머 상태 구독
    const unsubscribeTimer = subscribeToTimer((state) => {
      setTimerState(state);
      if (state) {
        if (state.isRunning && !state.isPaused && state.startTime) {
          // 실행 중일 때는 startTime 기반으로 계산
          setRemainingSeconds(calculateRemainingSeconds(state));
        } else {
          // 일시정지 또는 정지 상태일 때는 저장된 값 사용
          setRemainingSeconds(state.remainingSeconds);
        }
      }
    });

    // 기록 구독
    const unsubscribeRecords = subscribeToRecords((recs) => {
      setRecords(recs);
    });

    return () => {
      unsubscribeTimer();
      unsubscribeRecords();
    };
  }, [user]);

  useEffect(() => {
    if (!timerState || !timerState.isRunning || timerState.isPaused || !timerState.startTime) return;

    // startTime 기반으로 매 초마다 시간 계산
    const interval = setInterval(() => {
      const calculated = calculateRemainingSeconds(timerState);
      
      if (calculated <= 0) {
        // 시간이 0에 도달하면 자동으로 정지
        stopTimer(0).catch(console.error);
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(calculated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState?.isRunning, timerState?.isPaused, timerState?.startTime]);

  const handleStart = async () => {
    if (!teamName.trim()) {
      alert('팀 이름을 입력해주세요.');
      return;
    }
    
    // 새 팀이 오면 기존 타이머 초기화
    await resetTimer();
    await initializeTimer(teamName.trim());
    setRemainingSeconds(15 * 60);
  };

  const handlePause = async () => {
    if (timerState) {
      await pauseTimer(remainingSeconds);
    }
  };

  const handleResume = async () => {
    await resumeTimer();
  };

  const handleReset = async () => {
    await resetTimer();
    setTeamName('');
    setRemainingSeconds(15 * 60);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await deleteRecord(recordId);
      } catch (error) {
        console.error('기록 삭제 실패:', error);
        alert('기록 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-blue-600 text-xl">로딩 중...</div>
      </div>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatTime = (num: number) => num.toString().padStart(2, '0');
  
  const formatElapsedTime = (elapsedSeconds: number) => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}분 ${secs}초`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">관리자 페이지</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors w-full sm:w-auto"
          >
            로그아웃
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 타이머 제어 섹션 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">타이머 제어</h2>
            
            <div className="mb-6">
              <label htmlFor="teamName" className="block text-gray-700 mb-2 font-medium">
                팀 이름
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={timerState?.isRunning && !timerState?.isPaused}
              />
            </div>

            <div className="mb-6">
              <div className="text-3xl md:text-5xl font-mono font-bold text-blue-600 text-center mb-4">
                {formatTime(minutes)}:{formatTime(seconds)}
              </div>
              {timerState?.teamName && (
                <div className="text-center text-lg md:text-xl text-gray-700 mb-4">
                  현재 팀: {timerState.teamName}
                </div>
              )}
            </div>

            <TimerControls
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
              isRunning={timerState?.isRunning || false}
              isPaused={timerState?.isPaused || false}
              hasTimer={!!timerState && !!timerState.teamName}
            />
          </div>

          {/* 기록 섹션 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">완료 기록</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {records.length === 0 ? (
                <p className="text-gray-500 text-center py-8">기록이 없습니다.</p>
              ) : (
                records.map((record, index) => (
                  <div
                    key={record.id || index}
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">
                        {record.teamName}
                      </div>
                      {record.id && (
                        <button
                          onClick={() => handleDeleteRecord(record.id!)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                          title="삭제"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      완료 시간: {record.completedAt.toDate().toLocaleString('ko-KR')}
                    </div>
                    {record.elapsedTime !== undefined && (
                      <div className="text-sm text-blue-600 font-medium">
                        경과 시간: {formatElapsedTime(record.elapsedTime)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

