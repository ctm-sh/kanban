# 03. 구현 계획

## 1. 기술 구조

| 영역 | 선택 |
|---|---|
| 빌드 | Vite + React 18 + TypeScript |
| 백엔드 | Supabase (Postgres + Auth), `@supabase/supabase-js` |
| 드래그 앤 드롭 | `@dnd-kit/core` + `@dnd-kit/sortable` |
| 스타일 | CSS Modules + CSS 변수 (UI 라이브러리 없음), Pretendard |
| 상태 | 현재 팀 데이터를 담는 `useBoard` 훅 하나 + React Context. 변경은 화면에 먼저 반영한 뒤 Supabase에 저장 (실패하면 되돌림) |
| 테스트 | Vitest. 부하 계산과 position 계산 같은 순수 함수만 테스트 |

```
kanban/
├─ docs/
├─ supabase/        # schema.sql (테이블 + RLS 정책)
└─ src/
   ├─ lib/          # supabase 클라이언트, 부하 계산, position 계산
   ├─ hooks/        # useAuth, useBoard
   ├─ components/   # Sidebar, Board, Column, Card, 모달
   ├─ pages/        # LoginPage, BoardPage
   └─ styles/       # 토큰, 전역 스타일
```

## 2. 스키마 (데이터 모델 4개 + 외부 API라 작성)

```sql
create table teams   (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());
create table members (id uuid primary key default gen_random_uuid(), team_id uuid not null references teams on delete cascade, name text not null, color text not null);
create table columns (id uuid primary key default gen_random_uuid(), team_id uuid not null references teams on delete cascade, title text not null, position double precision not null, is_done boolean default false);
create table cards   (id uuid primary key default gen_random_uuid(), column_id uuid not null references columns on delete cascade, title text not null, description text default '', assignee_id uuid references members on delete set null, position double precision not null, created_at timestamptz default now());

-- 4개 테이블 모두 동일하게 적용
alter table teams enable row level security;
create policy "anon all" on teams for all to anon, authenticated using (true) with check (true);
```

- **position**: 실수값을 쓴다. 두 카드 사이에 넣을 때는 앞뒤 값의 중간값을 넣으므로, 다른 카드를 다시 번호 매길 필요가 없다
- **부하 계산**: `is_done = false`인 컬럼에 있는 카드 수를 담당자별로 센다. 담당자가 없는 카드는 "미배정"으로 따로 센다. 과부하 기준은 5장 초과

## 3. 마일스톤 개요

| # | 목표 | 끝나면 보이는 것 | 예상 |
|---|---|---|---|
| M1 | 셋업 + 스키마/RLS + 이메일 로그인 | 가입·로그인 후 빈 보드 화면, 로그아웃 동작 | 40분 |
| M2 | 사이드바 + 팀 CRUD·전환 | 팀을 만들고 전환하면 기본 컬럼 3개가 보임 | 30분 |
| M3 | 카드 CRUD + 상세 모달 | 컬럼 안에서 카드 추가, 모달에서 편집·삭제 | 35분 |
| M4 | 팀원 + 담당자 + 부하 바 + 필터 | "누가 얼마나?"가 숫자·막대로 보이고 클릭하면 필터됨 | 35분 |
| M5 | 드래그 앤 드롭 | 카드를 옮기면 부하 숫자가 즉시 바뀌고 새로고침해도 유지 | 35분 |
| M6 | 컬럼 관리 + 재조회 + 반응형 | 컬럼 추가·이름 변경·삭제, 다른 계정의 변경이 반영, 모바일 사이드바 접힘 | 30분 |
| M7 | 최종 QA | 체크리스트 통과, README | 20분 |

**합계**: 약 3시간 45분

## 4. 마일스톤 상세

### M1 — 셋업 + 스키마/RLS + 이메일 로그인 (40분)
**목표**: 로그인해야 들어갈 수 있는 빈 앱이 Supabase와 연결된 상태가 된다.

**할 일**
- [ ] Vite React-TS 프로젝트 생성, 의존성 설치, Vitest 설정
- [ ] `supabase/schema.sql` 작성 (테이블 4개 + RLS 정책 4개)
- [ ] (사용자) Supabase 프로젝트 생성, SQL Editor에서 schema.sql 실행, Auth의 "Confirm email" 끄기, URL과 anon key 전달
- [ ] `.env.local`과 `.env.example`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
- [ ] `useAuth`, 로그인·가입 화면 (이메일 + 비밀번호), 로그인 상태에 따라 화면 전환, 로그아웃
- [ ] 크림색 배경, 팔레트, 글꼴 토큰 정의

**완료 조건**
- [ ] 가입한 뒤 바로 로그인되고, 새로고침해도 로그인이 유지된다
- [ ] 로그아웃하면 로그인 화면으로 돌아간다
- [ ] 잘못된 비밀번호를 넣으면 오류 메시지가 보인다

**검증 방법**
- [ ] 자동: `npm run build`, `npm test`
- [ ] 수동: Supabase 대시보드에서 4개 테이블의 RLS가 켜져 있는지 확인

**중단 가능 지점**: 로그인만 되는 빈 껍데기 상태.

### M2 — 사이드바 + 팀 CRUD·전환 (30분)
**할 일**
- [ ] B 시안 레이아웃 (사이드바 220px + 보드 영역)
- [ ] 팀 목록, `+ 새 팀` 인라인 입력. 팀을 만들면 할 일 / 진행 중 / 완료(is_done) 컬럼 3개를 자동 생성
- [ ] 팀 설정 모달 (이름 변경, 삭제)
- [ ] 마지막으로 본 팀 ID를 localStorage에 저장하고 복원. 팀이 하나도 없으면 예시 팀 생성

**완료 조건**: 팀 2개를 만들어 전환하면 각자 독립된 컬럼이 보인다. 새로고침하면 마지막에 보던 팀이 열린다.
**검증**: build / 수동으로 팀 생성·이름 변경·삭제

### M3 — 카드 CRUD + 상세 모달 (35분)
**할 일**
- [ ] `useBoard`: 현재 팀의 columns와 cards를 불러오고 낙관적 업데이트
- [ ] 컬럼 하단의 `+ 추가` 인라인 입력 (Enter로 생성, Esc로 취소, 한글 IME 조합 중 Enter 무시)
- [ ] 카드 상세 모달: 제목·설명 편집, 삭제
- [ ] position 계산 함수와 단위 테스트

**완료 조건**: 카드 추가·편집·삭제 결과가 새로고침 뒤에도 유지된다. 한글을 입력하고 Enter를 쳐도 카드가 두 번 생기지 않는다.
**검증**: `npm test` (position) / 수동으로 S1의 4단계

### M4 — 팀원 + 담당자 + 부하 바 + 필터 (35분) ★ 차별점
**할 일**
- [ ] 사이드바 `+ 팀원` 인라인 입력. 8색 팔레트에서 순서대로 색 배정
- [ ] 카드 상세 모달에 담당자 칩 선택 (한 번 클릭으로 변경, 미배정 포함)
- [ ] 카드 왼쪽 4px 띠를 담당자 색으로, 카드 하단에 담당자 이니셜 표시
- [ ] **"누가 얼마나?" 부하 목록**: 팀원별 진행 중 카드 수를 숫자와 막대로 표시, 미배정 행 포함, 5장 초과면 주황색과 ⚠
- [ ] **행을 클릭하면 그 사람 카드만 표시하고, 다시 클릭하면 해제**. 필터 중 카드를 추가하면 그 사람을 담당자로 자동 지정
- [ ] 부하 계산 함수와 단위 테스트

**완료 조건**
- [ ] 담당자를 바꾸면 두 사람의 숫자와 막대가 즉시 갱신된다
- [ ] 부하 목록은 보드를 스크롤해도 항상 보인다 (차별점 원칙)

**검증**: `npm test` (부하 계산: 완료 컬럼 제외, 미배정, 과부하 경계값 5와 6) / 수동으로 S2 전체

### M5 — 드래그 앤 드롭 (35분)
**할 일**
- [ ] dnd-kit으로 같은 컬럼 안 순서 변경과 컬럼 간 이동
- [ ] 놓는 순간 position과 column_id를 낙관적으로 갱신하고, 저장에 실패하면 원래 자리로 되돌림
- [ ] 필터가 켜진 상태에서도 드래그가 정상 동작

**완료 조건**: 카드를 완료 컬럼으로 옮기면 부하 숫자가 1 줄고, 새로고침해도 순서가 유지된다.
**검증**: build / 수동으로 S1의 3단계

### M6 — 컬럼 관리 + 재조회 + 반응형 (30분)
**할 일**
- [ ] `+ 컬럼` 추가, 헤더 더블클릭으로 이름 변경, ⋯ 메뉴로 삭제(확인 포함)와 완료 컬럼 지정
- [ ] 창에 다시 포커스하면 현재 팀 데이터를 다시 불러옴
- [ ] 768px 미만에서 사이드바 접기와 ☰ 토글
- [ ] 빈 상태 안내 (팀 없음, 카드 없음, 필터 결과 없음)
- [ ] (시간이 남으면) 컬럼 드래그로 순서 변경

**완료 조건**: 브라우저 두 개에서 다른 계정으로 로그인해 한쪽에서 바꾸면, 다른 쪽 창을 클릭했을 때 반영된다.
**검증**: build / 수동으로 두 브라우저 테스트, DevTools 375px 화면

### M7 — 최종 QA (20분)
- A. `npm run build`, `npm test` 통과
- B. S1, S2 재현
- C. 375px와 1280px 화면에서 레이아웃 확인
- D. 새로고침 후 유지, 한글 IME, 빈 제목 거부, 100자 넘는 긴 제목의 줄바꿈
- E. README (Supabase 설정 방법, RLS 위험 경고), `.env.example`, `.gitignore`

## 5. 차별점 반영 위치
> 팀원별 진행 중인 카드 수(부하)가 보드 상단에 항상 보이고, 누르면 그 사람의 카드만 걸러서 보여준다.

- **기능**: M4의 할 일 "누가 얼마나? 부하 목록"과 "행 클릭 필터"
- **원칙**: M4 완료 조건 "보드를 스크롤해도 항상 보인다", M5 완료 조건 "드래그하면 부하 숫자가 즉시 바뀐다"
- B 시안을 고르면서 위치가 "보드 상단"에서 "왼쪽 사이드바"로 바뀌었다. 항상 보인다는 원칙은 그대로다

## 6. v2로 미루는 것
- Supabase Realtime 실시간 반영
- authenticated 전용 RLS 정책, 팀 초대와 권한
- 팀원과 로그인 계정 연결
- 컬럼 드래그 순서 변경 (M6에서 시간이 모자라면)
- 팀별 과부하 기준 설정, 라벨, 마감일, 댓글
