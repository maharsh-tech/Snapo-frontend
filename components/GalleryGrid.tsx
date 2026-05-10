'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, ExternalLink, Eye, Calendar, HardDrive, Loader2, Image as ImageIcon } from 'lucide-react'

interface ImageRecord {
  id: string
  encrypted_code: string
  file_name: string | null
  file_size: number | null
  uploaded_at: string
  views: number
}

export default function GalleryGrid({ initialImages, cfWorkerUrl }: { initialImages: ImageRecord[], cfWorkerUrl: string }) {
  const [images, setImages] = useState<ImageRecord[]>(initialImages)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (code: string, id: string) => {
    if (!confirm('Are you sure you want to delete this image? It will no longer be accessible.')) return
    
    setDeletingId(id)
    try {
      const res = await fetch(`/api/image/${code}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setImages(images.filter(img => img.id !== id))
      } else {
        alert('Failed to delete image')
      }
    } catch (err) {
      alert('An error occurred while deleting')
    } finally {
      setDeletingId(null)
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (images.length === 0) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-muted">
          <ImageIcon size={40} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No images yet</h3>
        <p className="text-muted mb-6">Upload some images to see them in your gallery.</p>
        <Link href="/" className="btn-primary">
          Upload Image
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {images.map((img) => (
        <div key={img.id} className="glass-panel overflow-hidden flex flex-col group relative">
          
          {/* Delete Overlay (while deleting) */}
          {deletingId === img.id && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          )}

          {/* Thumbnail */}
          <Link href={`/img/${img.encrypted_code}`} className="relative aspect-video bg-black/40 border-b border-white/5 overflow-hidden block group-hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`${cfWorkerUrl}/retrieve?file=${img.encrypted_code}`} 
              alt={img.file_name || 'Gallery image'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <ExternalLink size={16} /> View Details
              </span>
            </div>
          </Link>

          {/* Details */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-medium text-sm truncate mb-3" title={img.file_name || 'Untitled'}>
              {img.file_name || 'Untitled Image'}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-muted mt-auto mb-4">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(img.uploaded_at)}</span>
              <span className="flex items-center gap-1.5"><Eye size={14} /> {img.views}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs text-muted flex items-center gap-1.5"><HardDrive size={14} /> {formatBytes(img.file_size)}</span>
              <button 
                onClick={(e) => { e.preventDefault(); handleDelete(img.encrypted_code, img.id); }}
                className="text-muted hover:text-error transition p-1.5 rounded-md hover:bg-error/10"
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
