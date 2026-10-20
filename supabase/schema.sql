-- Kanban schema: teams > columns > cards, members per team
-- RLS 정책은 의도적으로 anon 전체 허용 (docs/01-requirements.md "알려진 위험" 참고)

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 50),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  color text not null
);

create table public.columns (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 40),
  position double precision not null,
  is_done boolean not null default false
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  assignee_id uuid references public.members (id) on delete set null,
  position double precision not null,
  created_at timestamptz not null default now()
);

-- FK 조회 + position 정렬
create index members_team_id_idx on public.members (team_id);
create index columns_team_position_idx on public.columns (team_id, position);
create index cards_column_position_idx on public.cards (column_id, position);
create index cards_assignee_id_idx on public.cards (assignee_id);

-- RLS: anon / authenticated 모두 전체 허용
alter table public.teams enable row level security;
alter table public.members enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

create policy "anon all" on public.teams for all to anon, authenticated using (true) with check (true);
create policy "anon all" on public.members for all to anon, authenticated using (true) with check (true);
create policy "anon all" on public.columns for all to anon, authenticated using (true) with check (true);
create policy "anon all" on public.cards for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.teams, public.members, public.columns, public.cards to anon, authenticated;
