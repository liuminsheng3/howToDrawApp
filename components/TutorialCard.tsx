'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

type Tutorial = {
  id: string
  title: string
  intro: string
  outro: string
  created_at: string
  status?: string
  tutorial_steps?: Array<{
    step_number: number
    text: string
    image_url: string
    stored_image_url?: string
  }>
}

interface TutorialCardProps {
  tutorial: Tutorial
  onDelete?: () => void
}

export default function TutorialCard({ tutorial, onDelete }: TutorialCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this tutorial?')) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tutorials/${tutorial.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      if (onDelete) onDelete()
    } catch (error) {
      console.error('Error deleting tutorial:', error)
      alert('Failed to delete tutorial')
    } finally {
      setIsDeleting(false)
    }
  }
  
  const togglePreview = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPreview(!showPreview)
  }
  
  const lastStep = tutorial.tutorial_steps?.[tutorial.tutorial_steps.length - 1]
  const previewImage = lastStep?.stored_image_url || lastStep?.image_url
  
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/tutorials/${tutorial.id}`}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold flex-1">{tutorial.title}</h2>
            <div className="flex gap-2 ml-2">
              {tutorial.status === 'ready' && previewImage && (
                <button
                  onClick={togglePreview}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title={showPreview ? "Hide preview" : "Show preview"}
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600 disabled:opacity-50"
                title="Delete tutorial"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutorial.intro}</p>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {new Date(tutorial.created_at).toLocaleDateString()}
            </p>
            {tutorial.status === 'generating' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Generating...
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {showPreview && previewImage && (
        <div className="border-t bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Final Result Preview:</p>
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            <Image
              src={previewImage}
              alt="Final result preview"
              fill
              className="object-contain rounded-lg border bg-white"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
          {tutorial.outro && (
            <p className="text-sm text-gray-600 mt-3 text-center">{tutorial.outro}</p>
          )}
        </div>
      )}
    </div>
  )
}