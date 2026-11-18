'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function GoogleButton({ next = '/' }: { next?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setIsLoading(true)
    setError(null)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/oauth?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" className="w-full" onClick={signIn} disabled={isLoading}>
        {isLoading ? '이동 중...' : 'Google로 계속하기'}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
