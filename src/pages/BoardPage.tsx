import styles from './BoardPage.module.css'

type Props = {
  email: string
  onSignOut: () => void
}

// M1: B 시안 골격만. 팀/컬럼/카드는 M2부터 채운다
export function BoardPage({ email, onSignOut }: Props) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.dot} aria-hidden />
          Kanban
        </div>

        <section>
          <h2 className={styles.sectionTitle}>팀</h2>
          <p className={styles.empty}>아직 팀이 없어요</p>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>누가 얼마나?</h2>
          <p className={styles.empty}>팀원이 생기면 여기에 표시돼요</p>
        </section>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.teamName}>보드</h1>
          <div className={styles.account}>
            <span className={styles.email}>{email}</span>
            <button type="button" className={styles.signOut} onClick={onSignOut} title="로그아웃" aria-label="로그아웃">
              ⏻
            </button>
          </div>
        </header>

        <div className={styles.board}>
          <div className={styles.placeholder}>팀을 만들면 할 일 · 진행 중 · 완료 컬럼이 여기에 나타나요</div>
        </div>
      </div>
    </div>
  )
}
