import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Column = { id: string; team_id: string; title: string; position: number; is_done: boolean }

type Loaded = { teamId: string; columns: Column[]; error: string | null }

// 현재 팀의 보드 데이터. M2는 컬럼만, 카드는 M3에서 추가
export function useBoard(teamId: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!teamId) return
    // 팀을 빠르게 바꾸면 늦게 온 이전 팀 응답은 버린다
    let cancelled = false
    supabase
      .from('columns')
      .select('*')
      .eq('team_id', teamId)
      .order('position')
      .then(({ data, error }) => {
        if (cancelled) return
        setLoaded(error ? { teamId, columns: [], error: '보드를 불러오지 못했어요.' } : { teamId, columns: data as Column[], error: null })
      })
    return () => {
      cancelled = true
    }
  }, [teamId])

  // 다른 팀의 데이터가 남아 있으면 아직 불러오는 중으로 본다
  const current = loaded && loaded.teamId === teamId ? loaded : null
  return {
    columns: current?.columns ?? [],
    loading: teamId !== null && current === null,
    error: current?.error ?? null,
  }
}
