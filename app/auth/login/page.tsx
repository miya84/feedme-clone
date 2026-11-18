import { LoginForm } from '@/components/login-form'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next: requested, error } = await searchParams
  // 같은 사이트 안의 경로만 허용한다.
  const next = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm next={next} oauthFailed={error === 'oauth'} />
      </div>
    </div>
  )
}
