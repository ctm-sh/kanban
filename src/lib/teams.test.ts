import { describe, expect, it } from 'vitest'
import { defaultColumnRows, normalizeTeamName, pickTeamId } from './teams'

describe('pickTeamId', () => {
  const teams = [{ id: 'a' }, { id: 'b' }]

  it('저장된 팀이 있으면 그 팀을 고른다', () => {
    expect(pickTeamId(teams, 'b')).toBe('b')
  })

  it('저장된 팀이 지워졌으면 첫 번째 팀을 고른다', () => {
    expect(pickTeamId(teams, 'gone')).toBe('a')
    expect(pickTeamId(teams, null)).toBe('a')
  })

  it('팀이 없으면 null', () => {
    expect(pickTeamId([], 'a')).toBeNull()
  })
})

describe('normalizeTeamName', () => {
  it('앞뒤 공백을 지운다', () => {
    expect(normalizeTeamName('  디자인팀 ')).toBe('디자인팀')
  })

  it('빈 이름과 50자 초과는 거부한다', () => {
    expect(normalizeTeamName('   ')).toBeNull()
    expect(normalizeTeamName('가'.repeat(50))).toBe('가'.repeat(50))
    expect(normalizeTeamName('가'.repeat(51))).toBeNull()
  })
})

describe('defaultColumnRows', () => {
  it('할 일 / 진행 중 / 완료 순서이고 완료만 is_done', () => {
    const rows = defaultColumnRows('t1')
    expect(rows.map((r) => r.title)).toEqual(['할 일', '진행 중', '완료'])
    expect(rows.map((r) => r.is_done)).toEqual([false, false, true])
    expect(rows.every((r) => r.team_id === 't1')).toBe(true)
    expect(rows[0].position).toBeLessThan(rows[1].position)
    expect(rows[1].position).toBeLessThan(rows[2].position)
  })
})
