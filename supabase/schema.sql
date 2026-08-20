-- ============================================================
--  산책자들 — 데이터베이스 스키마
--  Supabase 프로젝트 > SQL Editor 에 붙여넣고 한 번 실행하세요.
-- ============================================================

-- ---------- 회원 (profiles) ----------
-- 로그인한 사용자마다 한 줄. auth.users 와 1:1로 연결됩니다.
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '산책자',
  bio        text default '',
  tint       text default '#B0791F',
  created_at timestamptz not null default now()
);

-- ---------- 도서 (books) ----------
create table if not exists books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  status      text not null default '예정' check (status in ('예정','진행중','완료')),
  spine       text default '#5E7A63',
  blurb       text default '',
  meeting     text default '',
  plan_period text default '',
  plan_total  int  default 10,
  plan_done   int  default 0,
  plan_note   text default '',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- 독서 생각 / 독후감 (reflections) ----------
create table if not exists reflections (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid not null references books(id) on delete cascade,
  author_id    uuid not null references profiles(id) on delete cascade,
  title        text default '',
  key_sentence text default '',   -- 핵심 한 문장
  body         text not null,
  quote        text default '',
  created_at   timestamptz not null default now()
);

-- ---------- 토론 주제 (topics) ----------
create table if not exists topics (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  topic_date  text default '',
  background  text default '',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- 입장 (stances) : 주제별 회원 1명당 1개 ----------
create table if not exists stances (
  topic_id   uuid not null references topics(id) on delete cascade,
  member_id  uuid not null references profiles(id) on delete cascade,
  side       text not null check (side in ('찬성','반대','중립')),
  updated_at timestamptz not null default now(),
  primary key (topic_id, member_id)
);

-- ---------- 주장 (arguments) ----------
create table if not exists arguments (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references topics(id) on delete cascade,
  author_id    uuid not null references profiles(id) on delete cascade,
  side         text not null check (side in ('찬성','반대','중립')),
  key_sentence text default '',   -- 핵심 한 문장
  body         text not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
--  보안 규칙 (Row Level Security)
--  기본 원칙: 로그인한 회원은 모두 열람 가능 / 글은 본인만 쓰고 고칠 수 있음
-- ============================================================
alter table profiles    enable row level security;
alter table books       enable row level security;
alter table reflections enable row level security;
alter table topics      enable row level security;
alter table stances     enable row level security;
alter table arguments   enable row level security;

-- profiles
create policy "회원 열람" on profiles for select to authenticated using (true);
create policy "내 프로필 생성" on profiles for insert to authenticated with check (id = auth.uid());
create policy "내 프로필 수정" on profiles for update to authenticated using (id = auth.uid());

-- books (누구나 등록 가능, 수정/삭제는 등록자만)
create policy "도서 열람" on books for select to authenticated using (true);
create policy "도서 등록" on books for insert to authenticated with check (auth.uid() is not null);
create policy "도서 수정" on books for update to authenticated using (created_by = auth.uid());
create policy "도서 삭제" on books for delete to authenticated using (created_by = auth.uid());

-- reflections
create policy "생각 열람" on reflections for select to authenticated using (true);
create policy "생각 작성" on reflections for insert to authenticated with check (author_id = auth.uid());
create policy "생각 수정" on reflections for update to authenticated using (author_id = auth.uid());
create policy "생각 삭제" on reflections for delete to authenticated using (author_id = auth.uid());

-- topics
create policy "주제 열람" on topics for select to authenticated using (true);
create policy "주제 등록" on topics for insert to authenticated with check (auth.uid() is not null);
create policy "주제 수정" on topics for update to authenticated using (created_by = auth.uid());
create policy "주제 삭제" on topics for delete to authenticated using (created_by = auth.uid());

-- stances
create policy "입장 열람" on stances for select to authenticated using (true);
create policy "내 입장 등록" on stances for insert to authenticated with check (member_id = auth.uid());
create policy "내 입장 수정" on stances for update to authenticated using (member_id = auth.uid());
create policy "내 입장 삭제" on stances for delete to authenticated using (member_id = auth.uid());

-- arguments
create policy "주장 열람" on arguments for select to authenticated using (true);
create policy "주장 작성" on arguments for insert to authenticated with check (author_id = auth.uid());
create policy "주장 수정" on arguments for update to authenticated using (author_id = auth.uid());
create policy "주장 삭제" on arguments for delete to authenticated using (author_id = auth.uid());

-- ============================================================
--  예시 데이터 (도서 · 토론 주제)
--  독후감/주장은 앱에서 회원들이 직접 남기면 쌓입니다.
-- ============================================================
insert into books (title, author, status, spine, blurb, meeting, plan_period, plan_total, plan_done, plan_note) values
  ('걷기의 인문학', '레베카 솔닛', '진행중', '#5E7A63', '걷는다는 평범한 행위를 사유·자유·저항의 역사로 다시 읽어낸 에세이.', '8월 28일 (목) 저녁 7시 · 연남동 책방', '8월 12일 – 8월 28일', 10, 6, '이번 주는 1부 ~ 3부'),
  ('데미안', '헤르만 헤세', '완료', '#7E5B6E', '한 소년이 자기 자신에게로 이르는 길을 그린 성장 소설.', '7월 24일 (목) · 마감', '7월 10일 – 7월 24일', 8, 8, '완독'),
  ('이방인', '알베르 카뮈', '완료', '#B0791F', '부조리한 세계 앞에 선 한 인간의 무심함과 정직함에 관한 소설.', '6월 26일 (목) · 마감', '6월 12일 – 6월 26일', 6, 6, '완독'),
  ('작별하지 않는다', '한강', '예정', '#5B6976', '눈 내리는 제주를 배경으로, 기억하고 애도하는 일에 관한 소설.', '9월 11일 (목) 저녁 7시 · 장소 미정', '8월 29일 부터', 10, 0, '다음 책, 곧 시작');

insert into topics (title, topic_date, background) values
  ('주 4일 근무제, 지금 도입해야 할까?', '8월 21일 (금)', '노동 시간을 줄이면 삶의 질과 몰입도가 올라간다는 기대와, 생산성·인건비·업종별 형평성에 대한 우려가 맞선다. 우리 사회가 지금 이 제도를 받아들일 준비가 되었는지 이야기해 보자.'),
  ('AI가 만든 창작물에도 저작권을 인정해야 할까?', '9월 4일 (금)', 'AI가 그림과 글을 만들어내는 시대에, 그 결과물의 권리를 누구에게 줄 것인가. 인간 창작자 보호와 새로운 창작 방식의 인정 사이에서 균형점을 찾아보자.');
