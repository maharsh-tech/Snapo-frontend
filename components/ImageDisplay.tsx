'use client'

import { useState } from 'react'
import { Calendar, HardDrive, Eye, Download, Copy, CheckCircle2, Share2 } from 'lucide-react'

interface ImageMetadata {
  code: string
  fileName: string | null
  fileSize: number | null
  uploadDate: string
  views: number
  mimeType: string
}

export default function ImageDisplay({ imageUrl, metadata }: { imageUrl: string, metadata: ImageMetadata }) {
  const [copied, setCopied] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* Main Image Container */}
      <div className="glass-panel w-full overflow-hidden flex items-center justify-center min-h-[50vh] relative bg-black/40 border-white/10">
        
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        {hasError ? (
          <div className="text-center p-8 text-muted">
            <p className="text-error mb-2 text-lg">Failed to load image</p>
            <p className="text-sm">The image may have been removed or the storage backend is unavailable.</p>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={imageUrl} 
            alt={metadata.fileName || 'Uploaded image'} 
            className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true)
              setIsLoaded(true)
            }}
          />
        )}
      </div>

      {/* Info Bar */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Metadata stats */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(metadata.uploadDate)}</span>
          </div>
          <div className="hidden sm:block text-border-color">•</div>
          <div className="flex items-center gap-2">
            <HardDrive size={16} />
            <span>{formatBytes(metadata.fileSize)}</span>
          </div>
          <div className="hidden sm:block text-border-color">•</div>
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span>{metadata.views} views</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={copyToClipboard}
            className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle2 size={18} className="text-success" /> : <Copy size={18} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          
          <a 
            href={imageUrl} 
            download={metadata.fileName || 'download'} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Original</span>
          </a>
        </div>
        
      </div>
    </div>
  )
}
