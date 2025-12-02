'use client';

import { useState } from 'react';
import { USER_PASSWORD } from '@/lib/constants';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password === USER_PASSWORD) {
      onSuccess();
      setPassword('');
      onClose();
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
              setPassword(e.target.value);
              setError('');
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
              className="group relative flex-1 px-4 py-3 bg-transparent border-2 border-green-500 text-green-400 font-mono font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:border-green-400 hover:text-green-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
            >
              <span className="relative z-10 tracking-wider">SUMBIT</span>
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setError('');
                onClose();
              }}
              className="group relative flex-1 px-4 py-3 bg-transparent border-2 border-red-500 text-red-400 font-mono font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              <span className="relative z-10 tracking-wider">CANCEL</span>
              <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

