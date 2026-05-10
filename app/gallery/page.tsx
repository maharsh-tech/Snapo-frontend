import { createServiceClient, createClient } from '@/lib/supabase/server'
import GalleryGrid from '@/components/GalleryGrid'

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Middleware handles redirect
  }

  const supabaseAdmin = await createServiceClient()
  
  const { data: images, error } = await supabaseAdmin
    .from('images')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('uploaded_at', { ascending: false })

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 mb-1">Your Gallery</h1>
          <p className="text-muted">Manage your uploaded images</p>
        </div>
      </div>
      
      {error ? (
        <div className="p-4 rounded-md bg-error/10 text-error">
          Failed to load gallery. Please try again later.
        </div>
      ) : (
        <GalleryGrid initialImages={images || []} cfWorkerUrl={process.env.CF_WORKER_URL || ''} />
      )}
    </div>
  )
}
