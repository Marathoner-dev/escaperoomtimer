# Netlify 배포 가이드

이 문서는 Room Escape Timer 애플리케이션을 Netlify에 배포하는 방법을 안내합니다.

## 사전 준비

1. **GitHub 계정 및 저장소**
   - GitHub 계정이 있어야 합니다
   - 프로젝트를 GitHub 저장소에 푸시해야 합니다

2. **Firebase 프로젝트 설정 완료**
   - Firebase 프로젝트가 생성되어 있어야 합니다
   - Firestore 데이터베이스가 설정되어 있어야 합니다
   - Authentication (Google 로그인)이 활성화되어 있어야 합니다

## 배포 단계

### 1단계: GitHub에 프로젝트 푸시

```bash
# Git 초기화 (이미 초기화되어 있다면 생략)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit for Netlify deployment"

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 2단계: Netlify 계정 생성 및 사이트 생성

1. [Netlify](https://www.netlify.com)에 접속
2. "Sign up" 클릭하여 계정 생성 (GitHub 계정으로 로그인 권장)
3. 대시보드에서 "Add new site" > "Import an existing project" 클릭
4. "Deploy with GitHub" 선택
5. GitHub 저장소 선택 및 권한 부여
6. 저장소 선택 후 "Import" 클릭

### 3단계: 빌드 설정 확인

Netlify가 자동으로 다음 설정을 감지합니다:
- **Build command**: `npm run build`
- **Publish directory**: `.next` (자동 감지)
- **Node version**: `20` (netlify.toml에서 설정)

**중요**: `netlify.toml` 파일이 프로젝트 루트에 있어야 합니다.

### 4단계: 환경 변수 설정

1. Netlify 대시보드에서 사이트 선택
2. **Site settings** > **Environment variables** 클릭
3. 다음 환경 변수들을 추가합니다:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

각 값은 Firebase Console의 **프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성**에서 확인할 수 있습니다.

### 5단계: 배포 실행

1. 환경 변수 설정 후 **Deploy site** 클릭
2. 빌드가 완료될 때까지 대기 (보통 2-5분 소요)
3. 배포 완료 후 자동으로 생성된 URL 확인 (예: `https://random-name-123456.netlify.app`)

### 6단계: Firebase 승인된 도메인 추가

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. **Authentication** > **Settings** 탭
4. **승인된 도메인** 섹션에서 **도메인 추가** 클릭
5. Netlify 도메인 추가 (예: `your-site.netlify.app`)
6. **완료** 클릭

**참고**: 커스텀 도메인을 사용하는 경우, 커스텀 도메인도 추가해야 합니다.

### 7단계: 배포 확인

1. Netlify에서 제공하는 URL로 접속
2. 메인 페이지에서 타이머가 정상적으로 표시되는지 확인
3. `/admin/login` 경로로 접속하여 로그인이 정상 작동하는지 확인

## 커스텀 도메인 설정 (선택사항)

1. Netlify 대시보드에서 사이트 선택
2. **Domain settings** 클릭
3. **Add custom domain** 클릭
4. 도메인 입력 (예: `timer.yourdomain.com`)
5. DNS 설정 안내에 따라 도메인 제공업체에서 DNS 레코드 추가
6. SSL 인증서 자동 발급 대기 (보통 몇 분 소요)

## 자동 배포 설정

기본적으로 Netlify는 GitHub 저장소에 푸시할 때마다 자동으로 배포합니다.

### 배포 브랜치 설정

1. **Site settings** > **Build & deploy** > **Continuous Deployment**
2. **Branch deploys** 섹션에서 배포할 브랜치 선택 (기본: `main`)
3. **Deploy contexts**에서 프로덕션/프리뷰 브랜치 설정

### 환경 변수별 환경 설정

프로덕션과 프리뷰 환경에 다른 환경 변수를 설정할 수 있습니다:

1. **Site settings** > **Environment variables**
2. 환경 변수 추가 시 **Scopes**에서 환경 선택:
   - **Production**: 프로덕션 배포에만 적용
   - **Deploy previews**: 프리뷰 배포에만 적용
   - **Branch deploys**: 특정 브랜치 배포에만 적용

## 문제 해결

### 빌드 실패

1. **빌드 로그 확인**
   - Netlify 대시보드 > **Deploys** > 실패한 배포 클릭 > **Deploy log** 확인

2. **일반적인 원인**
   - 환경 변수가 누락되었거나 잘못됨
   - Node 버전 불일치 (`.nvmrc` 파일 확인)
   - 의존성 설치 실패 (`package.json` 확인)

### 로그인 작동 안 함

1. Firebase Console에서 승인된 도메인 확인
2. Netlify URL이 승인된 도메인에 추가되었는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 타이머 동기화 안 됨

1. Firestore 보안 규칙 확인
2. Firebase 프로젝트 ID가 환경 변수에 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 추가 리소스

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Firebase 문서](https://firebase.google.com/docs)

