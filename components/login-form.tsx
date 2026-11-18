'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type LoginFormProps = React.ComponentPropsWithoutRef<'div'> & {
  next?: string
  oauthFailed?: boolean
}

export function LoginForm({ className, next = '/', oauthFailed = false, ...props }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(next)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-lg tracking-normal">로그인</CardTitle>
          <CardDescription>이메일과 비밀번호로 로그인합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {oauthFailed && !error && (
                <p className="text-sm text-red-500">Google 로그인에 실패했습니다. 다시 시도해 주세요</p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              계정이 없으신가요?{' '}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
