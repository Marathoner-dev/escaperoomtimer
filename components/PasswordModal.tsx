'use client';

import { useState, useEffect } from 'react';
import { subscribeToPassword } from '@/lib/firestore';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPassword, setUserPassword] = useState('escapeneon'); // 기본값

  // Firestore에서 패스워드 구독
  useEffect(() => {
    const unsubscribe = subscribeToPassword((pwd) => {
      setUserPassword(pwd);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 이벤트 전파 방지
    
    if (isSubmitting) return; // 중복 제출 방지
    
    setError('');
    
    // 입력값 정리: 앞뒤 공백 제거, 소문자 변환
    const trimmedPassword = password.trim().toLowerCase();
    const expectedPassword = userPassword.toLowerCase();
    
    // 디버깅용 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('Password check:', {
        input: `"${password}"`,
        trimmed: `"${trimmedPassword}"`,
        expected: `"${expectedPassword}"`,
        match: trimmedPassword === expectedPassword,
        inputLength: password.length,
        trimmedLength: trimmedPassword.length
      });
    }
    
    if (trimmedPassword === expectedPassword) {
      setIsSubmitting(true);
      try {
        // onSuccess가 비동기 함수이므로 await
        await onSuccess();
        setPassword('');
        onClose();
      } catch (error) {
        console.error('Password success handler error:', error);
        setError('처리 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('패스워드가 올바르지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-black/95 rounded-lg p-6 md:p-8 max-w-md w-full border-2 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)] backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
        <h2 className="text-2xl font-bold text-green-400 mb-2 font-mono tracking-wider">SECURITY ACCESS</h2>
        <p className="text-xs text-green-500/70 mb-6 font-mono">ENTER AUTHORIZATION CODE</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              // 입력값에서 불필요한 공백 제거 (앞뒤 공백은 유지, 중간 공백은 제거하지 않음)
              const value = e.target.value;
              setPassword(value);
              setError('');
            }}
            onKeyDown={(e) => {
              // Enter 키로 제출 (모바일 키보드에서도 작동)
              if (e.key === 'Enter') {
                // form의 submit 이벤트를 트리거
                const form = e.currentTarget.closest('form');
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
            placeholder="ENTER PASSWORD"
            className="w-full px-4 py-3 bg-black/50 text-green-400 font-mono tracking-widest rounded-lg border-2 border-green-500/50 focus:border-green-500 focus:outline-none focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] mb-4 transition-all duration-300 placeholder:text-green-500/30"
            autoFocus
          />
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-mono tracking-wide">⚠ ACCESS DENIED</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              disabled={isSubmitting}
              className="group relative flex-1 px-4 py-3 bg-transparent border-2 border-green-500 text-green-400 font-mono font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] active:border-green-400 active:text-green-300 active:shadow-[0_0_20px_rgba(34,197,94,0.5)] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative z-10 tracking-wider pointer-events-none">SUBMIT</span>
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 group-active:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            </button>
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setError('');
                onClose();
              }}
              className="group relative flex-1 px-4 py-3 bg-transparent border-2 border-red-500 text-red-400 font-mono font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] active:border-red-400 active:text-red-300 active:shadow-[0_0_20px_rgba(239,68,68,0.5)] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative z-10 tracking-wider pointer-events-none">CANCEL</span>
              <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 group-active:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

