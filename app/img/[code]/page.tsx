import { createServiceClient } from '@/lib/supabase/server'
import ImageDisplay from '@/components/ImageDisplay'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// Configure ISR / Caching
export const revalidate = 3600 // Revalidate every hour

interface PageProps {
  params: { code: string }
}

async function getImageMetadata(code: string) {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('encrypted_code', code)
    .eq('is_deleted', false)
    .single()

  if (error || !data) return null
  return data
}

// Generate dynamic Open Graph tags
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const code = params.code
  const data = await getImageMetadata(code)
  
  if (!data) return { title: 'Image Not Found' }

  const cfWorkerUrl = process.env.CF_WORKER_URL || ''
  const imageUrl = `${cfWorkerUrl}/retrieve?file=${code}`
  
  return {
    title: data.file_name || 'Snapo Image',
    description: `Uploaded on ${new Date(data.uploaded_at).toLocaleDateString()}`,
    openGraph: {
      images: [imageUrl],
      title: data.file_name || 'Snapo Image',
    },
    twitter: {
      card: 'summary_large_image',
      images: [imageUrl],
    }
  }
}

export default async function ImagePage({ params }: PageProps) {
  const code = params.code
  const data = await getImageMetadata(code)

  if (!data) {
    notFound()
  }

  // Trigger view increment (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/view/${code}`, {
    method: 'POST',
    cache: 'no-store'
  }).catch(() => {})

  const cfWorkerUrl = process.env.CF_WORKER_URL || ''
  const imageUrl = `${cfWorkerUrl}/retrieve?file=${code}`

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <ImageDisplay 
        imageUrl={imageUrl} 
        metadata={{
          code: data.encrypted_code,
          fileName: data.file_name,
          fileSize: data.file_size,
          uploadDate: data.uploaded_at,
          views: data.views,
          mimeType: data.mime_type
        }} 
      />
    </div>
  )
}
