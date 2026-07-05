# Collab 배포 가이드

## 로컬 Docker 실행 (개발 환경)

### 1. 환경변수 파일 준비
```bash
cp .env.example .env
# .env 파일을 열어 실제 값으로 채운다
```

### 2. 전체 스택 실행
```bash
docker compose up --build
```
브라우저에서 http://localhost 접속

### 3. 개별 서비스 재빌드
```bash
# 백엔드 코드 변경 후
docker compose up --build backend

# 프론트엔드 코드 변경 후
docker compose up --build frontend
```

### 4. 종료 / 데이터 초기화
```bash
docker compose down          # 컨테이너만 종료 (DB 데이터 유지)
docker compose down -v       # 컨테이너 + 볼륨 삭제 (DB 초기화)
```

---

## 무료 배포 — Railway (권장)

Railway는 GitHub 연동으로 push 시 자동 배포되며,  
월 $5 무료 크레딧 제공 (포트폴리오 소규모 트래픽에 충분).

### 아키텍처
```
GitHub push
  ├── Railway Backend Service  (Spring Boot Docker)
  ├── Railway MySQL Plugin      (관리형 DB)
  └── Vercel                   (React 정적 배포, 완전 무료)
```

---

### Step 1. Railway 프로젝트 생성

1. https://railway.app 접속 → GitHub으로 로그인
2. **New Project** → **Deploy from GitHub repo** → `collab-platform` 선택
3. 루트 디렉토리: `backend` 선택 (Dockerfile 자동 감지)

### Step 2. MySQL 플러그인 추가

Railway 프로젝트 대시보드 → **+ New** → **Database** → **MySQL**

생성되면 자동으로 환경변수가 생성됨:
- `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

### Step 3. 백엔드 환경변수 설정

Railway 백엔드 서비스 → **Variables** 탭에서 추가:

```
DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

SERVER_PORT=8080
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false

JWT_SECRET=여기에-32자-이상-랜덤-문자열
JWT_EXPIRATION_TIME=1800000
JWT_REFRESH_EXPIRATION_TIME=604800000

GOOGLE_CLIENT_ID=구글-클라이언트-ID
GOOGLE_CLIENT_SECRET=구글-클라이언트-시크릿

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=이메일@gmail.com
MAIL_PASSWORD=Gmail-앱-비밀번호
```

### Step 4. 백엔드 도메인 확인

Railway 서비스 → **Settings** → **Domains** → Generate Domain  
예: `collab-backend-production.up.railway.app`

### Step 5. 프론트엔드 — Vercel 배포

1. https://vercel.com 접속 → GitHub 로그인
2. **Add New Project** → `collab-platform` 선택
3. **Root Directory**: `frontend`
4. **Environment Variables** 추가:
   ```
   VITE_API_BASE_URL=https://collab-backend-production.up.railway.app/api
   ```
5. **Deploy** 클릭

Vercel 배포 완료 후 도메인 확인 (예: `collab.vercel.app`)

### Step 6. Google OAuth 리다이렉트 URI 등록

Google Cloud Console → OAuth 2.0 클라이언트 → **승인된 리디렉션 URI** 추가:
```
https://collab-backend-production.up.railway.app/login/oauth2/code/google
```

### Step 7. 백엔드 CORS 업데이트

`SecurityConfig.java`의 CORS allowedOrigins에 Vercel 도메인 추가:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",          // 로컬 개발
    "https://collab.vercel.app"       // 실제 도메인으로 교체
));
```
변경 후 GitHub push → Railway 자동 재배포

---

## Gmail 앱 비밀번호 발급 방법

이메일 인증 기능을 위해 일반 Gmail 비밀번호 대신 앱 비밀번호를 사용해야 함.

1. Google 계정 → **보안** → **2단계 인증** 활성화
2. **앱 비밀번호** → 앱 선택: 기타 → 이름: `collab`
3. 생성된 16자리 비밀번호를 `MAIL_PASSWORD`에 입력

---

## 배포 후 체크리스트

- [ ] http://localhost → Docker 로컬 정상 동작
- [ ] Railway 백엔드 헬스체크: `https://[railway-domain]/api/hello`
- [ ] Vercel 프론트엔드 회원가입 → 이메일 인증 정상 동작
- [ ] 로그인 후 문서 생성 → WebSocket 실시간 편집 동작
- [ ] Google 소셜 로그인 동작
