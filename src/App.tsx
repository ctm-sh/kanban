import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { BoardPage } from './pages/BoardPage'

function App() {
  const { session, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return null
  if (!session) return <LoginPage onSignIn={signIn} onSignUp={signUp} />
  return <BoardPage email={session.user.email ?? ''} onSignOut={signOut} />
}

export default App
