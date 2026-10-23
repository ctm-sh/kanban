import { useState, type FormEvent } from 'react'
import { TEAM_NAME_MAX, normalizeTeamName, type Team } from '../lib/teams'
import { Modal } from './Modal'
import styles from './TeamSettingsModal.module.css'

type Props = {
  team: Team
  onRename: (name: string) => Promise<boolean>
  onDelete: () => Promise<boolean>
  onClose: () => void
}

export function TeamSettingsModal({ team, onRename, onDelete, onClose }: Props) {
  const [name, setName] = useState(team.name)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const normalized = normalizeTeamName(name)
  const canSave = normalized !== null && normalized !== team.name && !busy

  async function handleRename(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setBusy(true)
    const ok = await onRename(normalized)
    setBusy(false)
    if (ok) onClose()
  }

  async function handleDelete() {
    setBusy(true)
    const ok = await onDelete()
    setBusy(false)
    if (ok) onClose()
  }

  return (
    <Modal title="팀 설정" onClose={onClose}>
      <form className={styles.form} onSubmit={handleRename}>
        <label className={styles.field}>
          <span>팀 이름</span>
          <input autoFocus value={name} maxLength={TEAM_NAME_MAX} onChange={(e) => setName(e.target.value)} />
        </label>
        <button type="submit" className={styles.primary} disabled={!canSave}>
          저장
        </button>
      </form>

      <div className={styles.danger}>
        {confirming ? (
          <>
            <p className={styles.warning}>
              <strong>{team.name}</strong> 팀을 삭제하면 컬럼, 카드, 팀원이 모두 지워지고 되돌릴 수 없어요.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => setConfirming(false)} disabled={busy}>
                취소
              </button>
              <button type="button" className={styles.delete} onClick={handleDelete} disabled={busy}>
                삭제
              </button>
            </div>
          </>
        ) : (
          <button type="button" className={styles.deleteLink} onClick={() => setConfirming(true)}>
            팀 삭제…
          </button>
        )}
      </div>
    </Modal>
  )
}
