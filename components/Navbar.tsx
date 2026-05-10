import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Image as ImageIcon, User, LogOut } from 'lucide-react'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link href="/" className="logo">
          <ImageIcon className="text-accent-secondary" />
          <span>Snapo</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/gallery" className="btn-secondary text-sm flex items-center gap-2">
                <User size={16} />
                Gallery
              </Link>
              <form action="/auth/signout" method="POST">
                <button type="submit" className="text-muted hover:text-white transition flex items-center gap-2 text-sm">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-white transition">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
