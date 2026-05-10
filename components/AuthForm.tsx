'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

type AuthMode = 'login' | 'signup'

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        // Auto sign-in if email confirmation is disabled
        router.push('/')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel p-8 animate-fade-in relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-accent-primary/20 blur-3xl pointer-events-none rounded-full"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
            <p className="text-muted text-sm">
              {isLogin 
                ? 'Sign in to manage your image gallery.' 
                : 'Sign up to keep track of your uploads and manage your gallery.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-error/10 border border-error/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error/90">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center mt-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-accent-primary hover:text-accent-primary-hover font-medium">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent-primary hover:text-accent-primary-hover font-medium">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
