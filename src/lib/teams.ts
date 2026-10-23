// 팀 관련 순수 함수와 상수
export type Team = { id: string; name: string; created_at: string }

export const TEAM_NAME_MAX = 50
export const EXAMPLE_TEAM_NAME = '예시 팀'

export const DEFAULT_COLUMNS = [
  { title: '할 일', is_done: false },
  { title: '진행 중', is_done: false },
  { title: '완료', is_done: true },
] as const

// position은 실수값. 1000 간격으로 띄워두면 사이에 중간값을 넣기 쉽다
export function defaultColumnRows(teamId: string) {
  return DEFAULT_COLUMNS.map((col, i) => ({ team_id: teamId, title: col.title, is_done: col.is_done, position: (i + 1) * 1000 }))
}

// 공백을 정리하고, 비었거나 너무 길면 null
export function normalizeTeamName(raw: string): string | null {
  const name = raw.trim()
  if (!name || name.length > TEAM_NAME_MAX) return null
  return name
}

// 저장된 팀이 아직 있으면 그 팀, 아니면 첫 번째 팀
export function pickTeamId(teams: { id: string }[], savedId: string | null): string | null {
  if (savedId && teams.some((t) => t.id === savedId)) return savedId
  return teams[0]?.id ?? null
}
