'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { UploadCloud, FileImage, X, CheckCircle2, Copy, Loader2, Link as LinkIcon } from 'lucide-react'

export default function Uploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; code: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    setError(null)
    setResult(null)
    setCopied(false)

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File is too large. Maximum size is 20MB.')
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult({
        url: data.url,
        code: data.encrypted_code
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetUploader = () => {
    clearSelection()
    setResult(null)
  }

  if (result) {
    return (
      <div className="glass-panel p-8 w-full max-w-2xl mx-auto animate-fade-in text-center">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="heading-2 mb-2">Upload Complete!</h2>
        <p className="text-muted mb-8">Your image is securely stored and ready to share.</p>

        {preview && (
          <div className="relative w-full max-w-sm mx-auto aspect-video mb-8 rounded-lg overflow-hidden border border-border-color shadow-glass">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center bg-black/40 border border-border-color rounded-lg p-2 mb-8">
          <LinkIcon size={20} className="text-muted ml-2 mr-3" />
          <input 
            type="text" 
            readOnly 
            value={result.url} 
            className="bg-transparent border-none outline-none text-white flex-1 text-sm sm:text-base"
          />
          <button 
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${copied ? 'bg-success text-white' : 'bg-accent-primary hover:bg-accent-primary-hover text-white'}`}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <button onClick={resetUploader} className="btn-secondary">
          Upload Another Image
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`upload-zone relative overflow-hidden flex flex-col items-center justify-center ${isDragging ? 'drag-active' : ''} ${file ? 'border-accent-primary bg-accent-primary/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          className="hidden"
        />

        {file ? (
          <div className="w-full flex flex-col items-center animate-fade-in" onClick={e => e.stopPropagation()}>
            {preview ? (
              <div className="relative mb-6 rounded-lg overflow-hidden border border-border-color shadow-glass w-full max-w-sm aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={clearSelection}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-error/80 text-white p-1 rounded-full transition-colors"
                  title="Remove file"
                  disabled={isUploading}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-full bg-accent-primary/20 text-accent-primary">
                <FileImage size={48} />
              </div>
            )}
            
            <p className="font-medium text-lg mb-1 truncate max-w-xs">{file.name}</p>
            <p className="text-sm text-muted mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary w-full max-w-xs flex justify-center items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  Upload Image
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-accent-primary animate-pulse-glow">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop your image here</h3>
            <p className="text-muted mb-6">or click to browse files</p>
            <div className="text-xs text-muted flex gap-4">
              <span>JPG, PNG, GIF, WEBP</span>
              <span>•</span>
              <span>Max 20MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-md bg-error/10 border border-error/20 text-error flex items-start gap-3 animate-fade-in">
          <X size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
