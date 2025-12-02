'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle, getCurrentUser, isAdmin } from '@/lib/auth';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인되어 있고 관리자이면 관리자 페이지로 리다이렉트
    const user = getCurrentUser();
    if (user && isAdmin(user)) {
      router.push('/admin');
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border border-green-500">
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          관리자 로그인
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-300 text-center text-sm mb-4">
            구글 계정으로 로그인하세요
          </p>
          
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-4 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? '로그인 중...' : '구글로 로그인'}
          </button>
        </div>
        
        <p className="text-gray-400 text-xs text-center">
          등록된 관리자 이메일만 접근 가능합니다
        </p>
      </div>
    </div>
  );
}

