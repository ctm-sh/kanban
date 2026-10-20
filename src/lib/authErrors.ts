// Supabase Auth 오류 코드를 사용자용 한국어 문구로 바꾼다
const MESSAGES: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  email_not_confirmed: '이메일 인증이 필요합니다. 메일함을 확인해주세요.',
  user_already_exists: '이미 가입된 이메일입니다. 로그인해주세요.',
  email_exists: '이미 가입된 이메일입니다. 로그인해주세요.',
  weak_password: '비밀번호가 너무 약합니다. 6자 이상으로 입력해주세요.',
  validation_failed: '이메일 형식을 확인해주세요.',
  email_address_invalid: '사용할 수 없는 이메일 주소입니다.',
  over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  over_email_send_rate_limit: '메일 발송 한도를 넘었습니다. 잠시 후 다시 시도해주세요.',
}

export function toAuthMessage(error: { code?: string; message?: string } | null): string | null {
  if (!error) return null
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
  return '로그인 처리 중 문제가 생겼습니다. 다시 시도해주세요.'
}
