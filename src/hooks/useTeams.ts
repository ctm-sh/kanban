import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { EXAMPLE_TEAM_NAME, defaultColumnRows, pickTeamId, type Team } from '../lib/teams'

const LAST_TEAM_KEY = 'kanban:lastTeamId'

// localStorage는 사생활 보호 모드 등에서 막힐 수 있다
function readLastTeamId(): string | null {
  try {
    return localStorage.getItem(LAST_TEAM_KEY)
  } catch {
    return null
  }
}

function writeLastTeamId(id: string | null) {
  try {
    if (id) localStorage.setItem(LAST_TEAM_KEY, id)
    else localStorage.removeItem(LAST_TEAM_KEY)
  } catch {
    // 기억 못 해도 동작에는 지장 없음
  }
}

// 팀과 기본 컬럼 3개를 만든다. 컬럼 생성이 실패하면 팀도 지운다
async function insertTeam(name: string): Promise<Team> {
  const { data: team, error } = await supabase.from('teams').insert({ name }).select().single()
  if (error) throw error
  const { error: colError } = await supabase.from('columns').insert(defaultColumnRows(team.id))
  if (colError) {
    await supabase.from('teams').delete().eq('id', team.id)
    throw colError
  }
  return team as Team
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // StrictMode에서 effect가 두 번 돌아도 예시 팀이 두 개 생기지 않게
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function load() {
      const { data, error } = await supabase.from('teams').select('*').order('created_at')
      if (error) {
        setError('팀 목록을 불러오지 못했어요.')
        setLoading(false)
        return
      }
      let list = data as Team[]
      if (list.length === 0) {
        try {
          list = [await insertTeam(EXAMPLE_TEAM_NAME)]
        } catch {
          setError('예시 팀을 만들지 못했어요.')
        }
      }
      setTeams(list)
      setCurrentTeamId(pickTeamId(list, readLastTeamId()))
      setLoading(false)
    }
    void load()
  }, [])

  useEffect(() => {
    if (!loading) writeLastTeamId(currentTeamId)
  }, [currentTeamId, loading])

  async function createTeam(name: string): Promise<boolean> {
    try {
      const team = await insertTeam(name)
      setTeams((prev) => [...prev, team])
      setCurrentTeamId(team.id)
      return true
    } catch {
      setError('팀을 만들지 못했어요.')
      return false
    }
  }

  async function renameTeam(id: string, name: string): Promise<boolean> {
    const before = teams
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
    const { error } = await supabase.from('teams').update({ name }).eq('id', id)
    if (error) {
      setTeams(before)
      setError('팀 이름을 바꾸지 못했어요.')
      return false
    }
    return true
  }

  async function deleteTeam(id: string): Promise<boolean> {
    const before = { teams, currentTeamId }
    const rest = teams.filter((t) => t.id !== id)
    setTeams(rest)
    if (currentTeamId === id) setCurrentTeamId(pickTeamId(rest, null))
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) {
      setTeams(before.teams)
      setCurrentTeamId(before.currentTeamId)
      setError('팀을 삭제하지 못했어요.')
      return false
    }
    return true
  }

  return {
    teams,
    currentTeam: teams.find((t) => t.id === currentTeamId) ?? null,
    loading,
    error,
    clearError: () => setError(null),
    selectTeam: setCurrentTeamId,
    createTeam,
    renameTeam,
    deleteTeam,
  }
}
