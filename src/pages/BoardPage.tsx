import { useCallback, useState } from 'react'
import { Board } from '../components/Board'
import { Sidebar } from '../components/Sidebar'
import { TeamSettingsModal } from '../components/TeamSettingsModal'
import { useBoard } from '../hooks/useBoard'
import { useTeams } from '../hooks/useTeams'
import styles from './BoardPage.module.css'

type Props = {
  email: string
  onSignOut: () => void
}

export function BoardPage({ email, onSignOut }: Props) {
  const { teams, currentTeam, loading, error, clearError, selectTeam, createTeam, renameTeam, deleteTeam } = useTeams()
  const board = useBoard(currentTeam?.id ?? null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const message = error ?? board.error

  return (
    <div className={styles.layout}>
      <Sidebar teams={teams} currentTeamId={currentTeam?.id ?? null} onSelectTeam={selectTeam} onCreateTeam={createTeam} />

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.teamName}>{currentTeam?.name ?? '보드'}</h1>
            {currentTeam && (
              <button type="button" className={styles.iconButton} onClick={() => setSettingsOpen(true)} title="팀 설정" aria-label="팀 설정">
                ⚙
              </button>
            )}
          </div>
          <div className={styles.account}>
            <span className={styles.email}>{email}</span>
            <button type="button" className={styles.signOut} onClick={onSignOut} title="로그아웃" aria-label="로그아웃">
              ⏻
            </button>
          </div>
        </header>

        {message && (
          <div className={styles.error} role="alert">
            {message}
            {error && (
              <button type="button" className={styles.dismiss} onClick={clearError} aria-label="닫기">
                ✕
              </button>
            )}
          </div>
        )}

        <div className={styles.board}>
          {loading || board.loading ? null : currentTeam ? (
            <Board columns={board.columns} />
          ) : (
            <div className={styles.placeholder}>왼쪽의 + 새 팀으로 팀을 만들면 할 일 · 진행 중 · 완료 컬럼이 생겨요</div>
          )}
        </div>
      </div>

      {settingsOpen && currentTeam && (
        <TeamSettingsModal
          key={currentTeam.id}
          team={currentTeam}
          onRename={(name) => renameTeam(currentTeam.id, name)}
          onDelete={() => {
            // 낙관적으로 다른 팀으로 넘어가므로, 그 팀의 설정 모달이 잠깐 뜨지 않게 먼저 닫는다
            closeSettings()
            return deleteTeam(currentTeam.id)
          }}
          onClose={closeSettings}
        />
      )}
    </div>
  )
}
