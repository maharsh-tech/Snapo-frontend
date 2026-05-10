import Uploader from '@/components/Uploader'
import { createClient } from '@/lib/supabase/server'
import { Shield, Zap, Globe } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 text-accent-primary font-medium text-sm mb-6 animate-fade-in">
          Next-Gen Image Hosting
        </div>
        <h1 className="heading-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Host Images With Absolute Privacy
        </h1>
        <p className="text-lg text-muted mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Your images are securely stored in a private Telegram channel and delivered globally via Cloudflare Edge Network. 
          <span className="text-white font-medium block mt-2">Zero files stored on our servers.</span>
        </p>
        
        {/* Main Uploader */}
        <div className="w-full animate-fade-in relative z-10" style={{ animationDelay: '0.3s' }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-[2rem] blur opacity-20 pointer-events-none"></div>
          <div className="glass-panel p-2 sm:p-4 rounded-2xl relative">
            <Uploader />
          </div>
          
          {user ? (
            <p className="mt-6 text-sm text-muted">
              Uploading as <span className="text-white font-medium">{user.email}</span>. Images will be saved to your gallery.
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Uploading anonymously. <a href="/auth/signup" className="text-accent-primary hover:underline">Sign up</a> to keep track of your uploads.
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/5 bg-black/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield size={32} />}
              title="End-to-End Stateless"
              desc="We don't keep your files. Telegram acts as an infinite, secure storage backend."
            />
            <FeatureCard 
              icon={<Zap size={32} />}
              title="Edge Delivery"
              desc="Cloudflare Workers instantly stream your images to users worldwide with zero buffering."
            />
            <FeatureCard 
              icon={<Globe size={32} />}
              title="XOR Encrypted Access"
              desc="File IDs are cryptographically hashed. Only people with your unique URL can view the image."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 hover:-translate-y-1 transition-transform duration-300">
      <div className="w-14 h-14 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed">{desc}</p>
    </div>
  )
}
