import { useState, type FormEvent } from 'react'
import styles from './LoginPage.module.css'

type Mode = 'signin' | 'signup'
type AuthFn = (email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>

type Props = {
  onSignIn: AuthFn
  onSignUp: AuthFn
}

export function LoginPage({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const result = mode === 'signin' ? await onSignIn(email.trim(), password) : await onSignUp(email.trim(), password)
    setBusy(false)
    if (result.error) setError(result.error)
    else if (result.needsConfirmation) setNotice('가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해주세요.')
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <span className={styles.dot} aria-hidden />
          Kanban
        </div>
        <p className={styles.tagline}>누가 얼마나 들고 있는지 한눈에 보는 팀 보드</p>

        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? styles.tabActive : styles.tab} onClick={() => switchMode('signin')}>
            로그인
          </button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? styles.tabActive : styles.tab} onClick={() => switchMode('signup')}>
            가입
          </button>
        </div>

        <label className={styles.field}>
          <span>이메일</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="me@company.com" />
        </label>
        <label className={styles.field}>
          <span>비밀번호</span>
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
          />
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? '처리 중…' : mode === 'signin' ? '로그인' : '가입하고 시작하기'}
        </button>
      </form>
    </main>
  )
}
