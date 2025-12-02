import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { ADMIN_EMAILS } from '@/lib/constants';

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // 관리자 이메일 확인
    if (user.email && !ADMIN_EMAILS.includes(user.email)) {
      await signOut(auth);
      throw new Error('관리자 권한이 없습니다.');
    }
    
    return user;
  } catch (error: any) {
    if (error.message === '관리자 권한이 없습니다.') {
      throw error;
    }
    throw new Error('구글 로그인에 실패했습니다.');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  return auth.currentUser;
};

export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (typeof window === 'undefined') return () => {};
  return onAuthStateChanged(auth, callback);
};

