'use client';

import { useState, useEffect, useRef } from 'react';
import { subscribeToTimer, stopTimer, saveRecord, TimerState } from '@/lib/firestore';
import TimerDisplay from '@/components/TimerDisplay';
import PasswordModal from '@/components/PasswordModal';

const TIMER_DURATION = 15 * 60; // 15분

export default function HomePage() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const remainingSecondsRef = useRef(remainingSeconds);

  // remainingSeconds가 변경될 때마다 ref 업데이트
  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // AudioContext 초기화
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      return () => {
        ctx.close().catch(console.error);
      };
    } catch (error) {
      console.log('Audio context not available');
    }
  }, []);

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
    // 타이머 상태 구독
    const unsubscribe = subscribeToTimer((state) => {
      setTimerState(state);
      if (state) {
        if (state.isRunning && !state.isPaused && state.startTime) {
          // 실행 중일 때는 startTime 기반으로 계산
          setRemainingSeconds(calculateRemainingSeconds(state));
        } else {
          // 일시정지 또는 정지 상태일 때는 저장된 값 사용
          setRemainingSeconds(state.remainingSeconds);
        }
      } else {
        setRemainingSeconds(15 * 60);
      }
    });

    return () => unsubscribe();
  }, []);

  // 효과음 생성 함수
  const playTickSound = () => {
    if (!audioContext) return;
    
    try {
      // AudioContext가 suspended 상태면 resume
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 높은 주파수의 짧은 틱 소리 (첩보 영화 느낌)
      oscillator.frequency.value = 1600;
      oscillator.type = 'sawtooth';
      
      // 빠르게 페이드 아웃
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (error) {
      // 오디오 재생 실패 시 무시
      console.log('Failed to play tick sound');
    }
  };

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
      
      // 매 초마다 틱 소리 재생
      playTickSound();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState?.isRunning, timerState?.isPaused, timerState?.startTime]);

  const handlePasswordSuccess = async () => {
    if (timerState && timerState.teamName) {
      await stopTimer(remainingSeconds);
      await saveRecord(timerState.teamName, remainingSeconds);
      setIsPasswordModalOpen(false);
    }
  };

  const handleOpenPasswordModal = () => {
    if (timerState && timerState.isRunning && !timerState.isPaused) {
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <>
      <div className="relative">
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          teamName={timerState?.teamName}
          isRunning={timerState?.isRunning}
          isPaused={timerState?.isPaused}
        />
        
        {/* 패스워드 입력 버튼 - 타이머가 실행 중일 때만 표시 */}
        {timerState?.isRunning && !timerState?.isPaused && (
          <div className="absolute bottom-10 md:bottom-20 left-1/2 transform -translate-x-1/2 w-full px-4 flex justify-center">
            <button
              onClick={handleOpenPasswordModal}
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-green-500 text-green-400 font-mono font-semibold text-lg md:text-xl rounded-lg overflow-hidden transition-all duration-300 hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] w-full max-w-xs tracking-wider"
            >
              <span className="relative z-10">SECURE ACCESS</span>
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500/50 group-hover:bg-green-400 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-300"></div>
            </button>
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
}

