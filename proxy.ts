import { type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // 세션 갱신과 보호는 /settings에만 적용한다. 나머지 화면은 로그인 없이 열린다.
  matcher: ['/settings/:path*'],
}
