import { useEffect, type ReactNode } from 'react'
import styles from './Modal.module.css'

type Props = {
  title: string
  onClose: () => void
  children: ReactNode
}

// 바깥 클릭이나 Esc로 닫히는 공용 모달
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
