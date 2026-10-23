import type { Column } from '../hooks/useBoard'
import styles from './Board.module.css'

type Props = {
  columns: Column[]
}

// M2: 컬럼만 그린다. 카드는 M3에서
export function Board({ columns }: Props) {
  return (
    <div className={styles.board}>
      {columns.map((col, i) => (
        <section key={col.id} className={styles.column} style={{ background: `var(--col-${(i % 4) + 1})` }}>
          <header className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>{col.title}</h3>
            {col.is_done && (
              <span className={styles.doneBadge} title="이 컬럼의 카드는 부하 계산에서 빠져요">
                완료
              </span>
            )}
            <span className={styles.count}>0</span>
          </header>
          <p className={styles.empty}>카드가 없어요</p>
        </section>
      ))}
    </div>
  )
}
