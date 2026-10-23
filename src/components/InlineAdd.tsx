import { useState, type KeyboardEvent } from 'react'
import styles from './InlineAdd.module.css'

type Props = {
  label: string
  placeholder: string
  maxLength: number
  // 성공하면 true. 실패하면 입력값을 남겨둔다
  onSubmit: (value: string) => Promise<boolean>
}

// "+ 새 팀"처럼 누르면 그 자리에서 입력창이 열리는 추가 버튼
export function InlineAdd({ label, placeholder, maxLength, onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  function close() {
    setOpen(false)
    setValue('')
  }

  async function submit() {
    const trimmed = value.trim()
    if (!trimmed || busy) return
    setBusy(true)
    const ok = await onSubmit(trimmed)
    setBusy(false)
    if (ok) close()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // 한글 조합 중 Enter는 조합 확정용이라 무시
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') void submit()
    else if (e.key === 'Escape') close()
  }

  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {label}
      </button>
    )
  }

  return (
    <input
      className={styles.input}
      autoFocus
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      disabled={busy}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        if (!value.trim()) close()
      }}
    />
  )
}
