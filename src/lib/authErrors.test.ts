import { describe, expect, it } from 'vitest'
import { toAuthMessage } from './authErrors'

describe('toAuthMessage', () => {
  it('오류가 없으면 null', () => {
    expect(toAuthMessage(null)).toBeNull()
  })

  it('알려진 코드는 한국어 문구로 바꾼다', () => {
    expect(toAuthMessage({ code: 'invalid_credentials' })).toBe('이메일 또는 비밀번호가 올바르지 않습니다.')
  })

  it('모르는 코드는 일반 문구로 대체한다', () => {
    expect(toAuthMessage({ code: 'something_new', message: 'raw' })).toBe('로그인 처리 중 문제가 생겼습니다. 다시 시도해주세요.')
  })
})
