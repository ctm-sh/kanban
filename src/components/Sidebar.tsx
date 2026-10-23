import type { Team } from '../lib/teams'
import { TEAM_NAME_MAX } from '../lib/teams'
import { InlineAdd } from './InlineAdd'
import styles from './Sidebar.module.css'

type Props = {
  teams: Team[]
  currentTeamId: string | null
  onSelectTeam: (id: string) => void
  onCreateTeam: (name: string) => Promise<boolean>
}

export function Sidebar({ teams, currentTeamId, onSelectTeam, onCreateTeam }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.dot} aria-hidden />
        Kanban
      </div>

      <section>
        <h2 className={styles.sectionTitle}>팀</h2>
        <ul className={styles.teamList}>
          {teams.map((team) => {
            const active = team.id === currentTeamId
            return (
              <li key={team.id}>
                <button
                  type="button"
                  className={active ? styles.teamActive : styles.team}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => onSelectTeam(team.id)}
                  title={team.name}
                >
                  <span className={styles.radio} aria-hidden />
                  <span className={styles.teamName}>{team.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <InlineAdd label="+ 새 팀" placeholder="팀 이름 입력 후 Enter" maxLength={TEAM_NAME_MAX} onSubmit={onCreateTeam} />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>누가 얼마나?</h2>
        <p className={styles.empty}>팀원이 생기면 여기에 표시돼요</p>
      </section>
    </aside>
  )
}
