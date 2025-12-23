import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface TimerState {
  teamName: string;
  startTime: Timestamp | null;
  pausedTime: number; // 초 단위로 일시중지된 시간
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number; // 남은 시간 (초)
  password?: string; // 패스워드 (선택적)
}

export interface Record {
  id?: string; // 문서 ID
  teamName: string;
  completedAt: Timestamp;
  passwordEnteredAt: Timestamp;
  elapsedTime: number; // 사용한 시간 (초)
  remainingTime: number; // 남은 시간 (초)
}

const TIMER_DURATION = 15 * 60; // 15 * 1분 (60초)

export const getTimerState = async (): Promise<TimerState | null> => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    return timerSnap.data() as TimerState;
  }
  return null;
};

export const subscribeToTimer = (
  callback: (state: TimerState | null) => void
) => {
  const timerRef = doc(db, 'timer', 'current');
  
  return onSnapshot(timerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as TimerState);
    } else {
      callback(null);
    }
  });
};

export const initializeTimer = async (teamName: string) => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  const now = new Date();
  
  // 기존 문서가 있으면 password 필드를 유지하면서 업데이트
  if (timerSnap.exists()) {
    const currentData = timerSnap.data() as TimerState;
    await setDoc(timerRef, {
      ...currentData,
      teamName,
      startTime: Timestamp.fromDate(now),
      pausedTime: 0,
      isRunning: true,
      isPaused: false,
      remainingSeconds: TIMER_DURATION,
    }, { merge: true });
  } else {
    // 새로 생성하는 경우
    await setDoc(timerRef, {
      teamName,
      startTime: Timestamp.fromDate(now),
      pausedTime: 0,
      isRunning: true,
      isPaused: false,
      remainingSeconds: TIMER_DURATION,
    });
  }
};

export const pauseTimer = async (remainingSeconds: number) => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    const currentData = timerSnap.data() as TimerState;
    await setDoc(timerRef, {
      ...currentData,
      isPaused: true,
      isRunning: false,
      remainingSeconds,
    }, { merge: true });
  }
};

export const resumeTimer = async () => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    const currentData = timerSnap.data() as TimerState;
    const now = new Date();
    // remainingSeconds를 기준으로 역산하여 새로운 startTime 설정
    // 예: remainingSeconds가 600초면, 600초 전부터 시작한 것처럼 설정
    const elapsedSeconds = TIMER_DURATION - currentData.remainingSeconds;
    const newStartTime = new Date(now.getTime() - elapsedSeconds * 1000);
    
    await setDoc(timerRef, {
      ...currentData,
      startTime: Timestamp.fromDate(newStartTime),
      isPaused: false,
      isRunning: true,
    }, { merge: true });
  }
};

export const resetTimer = async () => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  // 기존 문서가 있으면 password 필드를 유지하면서 리셋
  if (timerSnap.exists()) {
    const currentData = timerSnap.data() as TimerState;
    await setDoc(timerRef, {
      ...currentData,
      teamName: '',
      startTime: null,
      pausedTime: 0,
      isRunning: false,
      isPaused: false,
      remainingSeconds: TIMER_DURATION,
    }, { merge: true });
  } else {
    // 문서가 없으면 새로 생성
    await setDoc(timerRef, {
      teamName: '',
      startTime: null,
      pausedTime: 0,
      isRunning: false,
      isPaused: false,
      remainingSeconds: TIMER_DURATION,
    });
  }
};

export const stopTimer = async (remainingSeconds: number) => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    const currentData = timerSnap.data() as TimerState;
    await setDoc(timerRef, {
      ...currentData,
      isRunning: false,
      isPaused: false,
      remainingSeconds,
    }, { merge: true });
  }
};

export const saveRecord = async (teamName: string, remainingSeconds: number) => {
  const now = Timestamp.now();
  const elapsedTime = TIMER_DURATION - remainingSeconds; // 사용한 시간 계산
  await addDoc(collection(db, 'records'), {
    teamName,
    completedAt: now,
    passwordEnteredAt: now,
    elapsedTime,
    remainingTime: remainingSeconds,
  });
};

export const updateTimerRemainingSeconds = async (remainingSeconds: number) => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    await setDoc(timerRef, {
      remainingSeconds,
    }, { merge: true });
  }
};

export const subscribeToRecords = (
  callback: (records: Record[]) => void
) => {
  const recordsRef = collection(db, 'records');
  const q = query(recordsRef, orderBy('completedAt', 'desc'), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const records: Record[] = [];
    snapshot.forEach((docSnapshot) => {
      records.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      } as Record);
    });
    callback(records);
  });
};

export const deleteRecord = async (recordId: string) => {
  const recordRef = doc(db, 'records', recordId);
  await deleteDoc(recordRef);
};

// 패스워드 관련 함수들 - timer 문서에 저장 (settings 컬렉션 대신)
export const getPassword = async (): Promise<string> => {
  const timerRef = doc(db, 'timer', 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    const data = timerSnap.data() as TimerState;
    return data.password || 'escapeneon';
  }
  
  return 'escapeneon';
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    // db가 초기화되지 않았으면 에러
    if (typeof window === 'undefined' || !db) {
      throw new Error('Firestore database is not initialized');
    }
    
    console.log('Attempting to update password...', { db: !!db });
    
    const timerRef = doc(db, 'timer', 'current');
    const timerSnap = await getDoc(timerRef);
    
    if (timerSnap.exists()) {
      // 기존 timer 문서가 있으면 password 필드만 업데이트 (다른 필드는 유지)
      const currentData = timerSnap.data() as TimerState;
      await setDoc(timerRef, {
        ...currentData,
        password: newPassword
      }, { merge: true });
    } else {
      // timer 문서가 없어도 패스워드만 저장 (타이머 시작 전에도 가능)
      // merge: true를 사용하여 나중에 타이머가 시작될 때 다른 필드가 추가되어도 문제없도록 함
      await setDoc(timerRef, {
        password: newPassword,
        teamName: '',
        startTime: null,
        pausedTime: 0,
        isRunning: false,
        isPaused: false,
        remainingSeconds: TIMER_DURATION
      }, { merge: true });
    }
    
    console.log('Password updated successfully');
  } catch (error: any) {
    console.error('updatePassword error:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      dbInitialized: typeof window !== 'undefined' && !!db
    });
    
    throw error;
  }
};

export const subscribeToPassword = (
  callback: (password: string) => void
) => {
  const timerRef = doc(db, 'timer', 'current');
  
  return onSnapshot(timerRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as TimerState;
      callback(data.password || 'escapeneon');
    } else {
      callback('escapeneon');
    }
  });
};

