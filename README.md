# 방탈출 타이머 애플리케이션

Next.js와 Firebase를 사용한 방탈출 게임용 타이머 애플리케이션입니다.

## 주요 기능

- **관리자 페이지**: 팀 관리 및 타이머 제어
- **사용자 페이지**: 실시간 타이머 표시 및 패스워드 입력
- **구글 로그인**: 관리자 인증
- **실시간 동기화**: Firestore를 통한 실시간 타이머 상태 동기화

## Firebase 연동 가이드

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "room-escape-timer")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firebase 프로젝트 설정

#### 2.1 웹 앱 등록

1. Firebase Console에서 프로젝트 선택
2. 프로젝트 개요 페이지에서 웹 아이콘(</>) 클릭
3. 앱 닉네임 입력 (예: "Room Escape Timer")
4. "Firebase Hosting도 설정" 체크 해제 (선택사항)
5. "앱 등록" 클릭
6. Firebase SDK 설정 정보 확인 (다음 단계에서 사용)

#### 2.2 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

각 값은 Firebase Console의 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성에서 확인할 수 있습니다.

### 3. Authentication 설정

#### 3.1 Google 로그인 활성화

1. Firebase Console에서 **Authentication** 메뉴 선택
2. **Sign-in method** 탭 클릭
3. **Google** 제공업체 클릭
4. **사용 설정** 토글을 켜기
5. 프로젝트 지원 이메일 선택 (기본값 사용 가능)
6. **저장** 클릭

#### 3.2 승인된 도메인 설정

1. Authentication > **Settings** 탭 선택
2. **승인된 도메인** 섹션에서:
   - 로컬 개발: `localhost`가 기본으로 포함되어 있음
   - 배포 시: 실제 도메인 추가 (예: `yourdomain.com`)

### 4. Firestore 데이터베이스 설정

#### 4.1 Firestore 데이터베이스 생성

1. Firebase Console에서 **Firestore Database** 메뉴 선택
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드에서 시작** 선택 (테스트 모드도 가능하지만 보안 규칙 설정 필요)
4. 위치 선택 (가장 가까운 리전 선택, 예: `asia-northeast3` - 서울)
5. **사용 설정** 클릭

#### 4.2 보안 규칙 설정

Firestore Database > **규칙** 탭에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 타이머 문서 - 모든 사용자가 읽기 가능, 관리자만 쓰기 가능
    match /timer/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 기록 문서 - 모든 사용자가 읽기 가능, 관리자만 쓰기 가능
    match /records/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**주의**: 프로덕션 환경에서는 더 엄격한 규칙을 설정하는 것을 권장합니다.

#### 4.3 컬렉션 구조

애플리케이션은 다음 컬렉션을 사용합니다:

**`timer` 컬렉션**
- 문서 ID: `current` (단일 문서)
- 필드:
  - `teamName` (string): 현재 팀 이름
  - `startTime` (timestamp): 타이머 시작 시간
  - `pausedTime` (number): 일시중지된 시간 (초)
  - `isRunning` (boolean): 타이머 실행 여부
  - `isPaused` (boolean): 타이머 일시중지 여부
  - `remainingSeconds` (number): 남은 시간 (초)

**`records` 컬렉션**
- 문서: 자동 생성 ID
- 필드:
  - `teamName` (string): 완료한 팀 이름
  - `completedAt` (timestamp): 완료 시간
  - `passwordEnteredAt` (timestamp): 패스워드 입력 시간

### 5. 관리자 이메일 등록

`lib/constants.ts` 파일에서 관리자 이메일을 등록하세요:

```typescript
export const ADMIN_EMAILS = [
  'your-email@gmail.com', // 실제 관리자 이메일
  'another-admin@gmail.com', // 추가 관리자 (선택사항)
];
```

**중요**: 등록된 이메일로만 관리자 페이지에 접근할 수 있습니다.

### 6. 개발 서버 실행

```bash
# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 7. 배포 (선택사항)

#### 7.1 Netlify 배포 (권장)

1. **GitHub에 프로젝트 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Netlify 계정 생성 및 프로젝트 연결**
   - [Netlify](https://www.netlify.com)에 접속하여 계정 생성
   - "Add new site" > "Import an existing project" 클릭
   - GitHub 저장소 선택 및 연결

3. **빌드 설정**
   - Build command: `npm run build` (자동 감지됨)
   - Publish directory: `.next` (자동 감지됨)
   - Node version: `20` (netlify.toml에 설정됨)

4. **환경 변수 설정**
   - Site settings > Environment variables에서 다음 변수 추가:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

5. **배포**
   - "Deploy site" 클릭
   - 배포 완료 후 자동으로 생성된 URL 확인 (예: `https://your-site.netlify.app`)

6. **Firebase 승인된 도메인 추가**
   - Firebase Console > Authentication > Settings > 승인된 도메인
   - Netlify 도메인 추가 (예: `your-site.netlify.app`)

#### 7.2 Vercel 배포

1. [Vercel](https://vercel.com)에 계정 생성
2. GitHub에 프로젝트 푸시
3. Vercel에서 프로젝트 import
4. 환경변수 추가 (`.env.local`의 값들)
5. 배포 완료

#### 7.3 Firebase Hosting 배포

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

## 사용 방법

### 관리자 페이지 (`/admin`)

1. `/admin/login` 접속
2. "구글로 로그인" 클릭
3. 등록된 관리자 이메일로 로그인
4. 팀 이름 입력 후 타이머 시작
5. 일시중지/재개/초기화 기능 사용
6. 완료 기록 확인

### 사용자 페이지 (`/`)

1. 메인 페이지 접속
2. 실시간 타이머 확인
3. 타이머가 실행 중일 때 "패스워드 입력" 버튼 클릭
4. 패스워드 입력 (기본값: `escapeneon`)
5. 패스워드 확인 시 타이머 정지 및 기록 저장

## 문제 해결

### 로그인이 안 되는 경우

1. Firebase Console에서 Google 로그인이 활성화되어 있는지 확인
2. 승인된 도메인에 현재 도메인이 포함되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 타이머가 동기화되지 않는 경우

1. Firestore 데이터베이스가 생성되어 있는지 확인
2. 보안 규칙이 올바르게 설정되어 있는지 확인
3. 환경변수가 올바르게 설정되어 있는지 확인

### 관리자 페이지 접근이 안 되는 경우

1. `lib/constants.ts`의 `ADMIN_EMAILS`에 이메일이 등록되어 있는지 확인
2. 로그인한 이메일과 등록된 이메일이 정확히 일치하는지 확인 (대소문자 구분 없음)

## 기술 스택

- **Next.js 14+**: React 프레임워크
- **TypeScript**: 타입 안정성
- **Firebase**: 
  - Authentication (구글 로그인)
  - Firestore (실시간 데이터베이스)
- **Tailwind CSS**: 스타일링

## 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

