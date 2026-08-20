# 산책자들 · 독서/시사토론 모임 앱

읽고 걷고 나누는 우리 모임의 기록이 쌓이는 웹 앱입니다.
**Vite + React**(화면), **Supabase**(데이터베이스·로그인·저장)로 만들어졌습니다.

---

## 처음 실행하기 (한 번만)

준비물: 컴퓨터에 **Node.js 18 이상** 설치. (없으면 https://nodejs.org 에서 LTS 버전 설치)

### 1. 패키지 설치
프로젝트 폴더에서 터미널을 열고:
```
npm install
```

### 2. Supabase 프로젝트 만들기
1. https://supabase.com 에 가입하고 **New project** 로 새 프로젝트를 만듭니다. (지역은 가까운 곳, 예: Northeast Asia)
2. 프로젝트가 준비되면 왼쪽 메뉴 **SQL Editor** 로 갑니다.
3. 이 폴더의 `supabase/schema.sql` 파일 내용을 통째로 복사해 붙여넣고 **Run** 을 누릅니다.
   → 테이블과 보안 규칙, 예시 도서·토론 주제가 한 번에 만들어집니다.

### 3. 열쇠 값 넣기 (.env)
1. Supabase 왼쪽 아래 **Project Settings → API** 로 갑니다.
2. **Project URL** 과 **anon public** 키를 복사합니다.
3. 이 폴더의 `.env.example` 을 복사해 `.env` 라는 이름의 파일을 만들고, 값을 채웁니다:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_anon_public_키
```

### 4. 로그인 주소 설정
Supabase **Authentication → URL Configuration** 에서
**Site URL** 을 `http://localhost:5173` 로 지정합니다.
(이메일 로그인은 기본으로 켜져 있습니다.)

### 5. 실행
```
npm run dev
```
브라우저에서 `http://localhost:5173` 을 엽니다.
이메일을 입력하면 로그인 링크가 메일로 오고, 그 링크를 누르면 들어옵니다.

> 참고: Supabase 기본 메일은 하루 발송량이 적어 테스트용입니다.
> 본격적으로 쓸 때는 Authentication 설정에서 별도 메일(SMTP)을 연결하면 좋습니다.

---

## 나중에 인터넷에 올리기 (배포)

1. 이 폴더를 GitHub 저장소에 올립니다.
2. https://vercel.com 에서 그 저장소를 **Import** 합니다.
3. Vercel 프로젝트 설정의 **Environment Variables** 에 위 두 값(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)을 넣습니다.
4. 배포되면 나온 주소(예: `https://sanchakja.vercel.app`)를
   Supabase **Authentication → URL Configuration** 의 Site URL/Redirect URLs 에도 추가합니다.
5. 이제 회원들에게 그 링크만 공유하면 됩니다.

---

## 폴더 구조

```
sanchakja/
├─ index.html
├─ package.json
├─ .env.example         ← 복사해서 .env 로
├─ supabase/
│   └─ schema.sql        ← Supabase SQL Editor 에 한 번 실행
└─ src/
    ├─ main.jsx          ← 진입점
    ├─ App.jsx           ← 로그인 확인 + 화면 이동(내비)
    ├─ index.css         ← 폰트·공통 스타일
    ├─ lib/
    │   ├─ supabase.js   ← Supabase 연결
    │   ├─ theme.js      ← 색상 팔레트
    │   └─ api.js        ← 모든 데이터 읽기/쓰기 (여기만 보면 데이터 흐름이 보여요)
    ├─ components/
    │   └─ ui.jsx        ← 아바타·칩·현황 바 같은 공통 조각
    └─ pages/
        ├─ Login.jsx     ← 이메일 로그인
        ├─ Home.jsx      ← 홈(다가오는 모임 + 산책 기록)
        ├─ Reading.jsx   ← 독서토론(서재 + 책 상세 + 생각 쓰기)
        ├─ Debate.jsx    ← 시사토론(주제 목록 + 상세 + 주장 쓰기)
        └─ Profile.jsx   ← 내 서재(내 글 + 프로필 편집 + 로그아웃)
```

---

## 지금 되는 것
- 이메일 로그인 (비밀번호 없이 링크로)
- 독서토론: 서재, 독서 계획, 독후감 쓰기 — **핵심 한 문장** 포함
- 시사토론: 찬반 입장 표시, 주장 쓰기 — **핵심 한 문장** 포함
- 홈의 활동 타임라인, 내 서재에서 내 글 모아보기

## 다음에 붙이면 좋은 것 (아이디어)
- 댓글 기능, 자료 파일 업로드(Supabase Storage)
- 모임 일정 캘린더, 새 책·새 토론 등록 화면
- 아카이브 검색, 알림

이 앱은 **시작점**입니다. 여기서부터는 Claude Code 같은 개발 도구에서
"이 부분을 이렇게 바꿔줘" 하고 대화하며 키워가면 됩니다.
