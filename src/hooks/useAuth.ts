import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toAuthMessage } from '../lib/authErrors'

type AuthResult = { error: string | null; needsConfirmation?: boolean }

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: toAuthMessage(error) }
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: toAuthMessage(error) }
    // Confirm email이 켜져 있으면 세션 없이 돌아온다
    return { error: null, needsConfirmation: !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, loading, signIn, signUp, signOut }
}
