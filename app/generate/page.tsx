'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import GenerationProgress from '@/components/GenerationProgress'
import Image from 'next/image'
import Link from 'next/link'

export default function GeneratePage() {
  const [topic, setTopic] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tutorialId, setTutorialId] = useState<string | null>(null)
  const [tutorialData, setTutorialData] = useState<any>(null)
  const [categoryPath, setCategoryPath] = useState<string>('')
  const router = useRouter()
  
  // Poll for tutorial updates
  useEffect(() => {
    if (!tutorialId) return
    
    const checkTutorial = async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*, tutorial_steps(*)')
        .eq('id', tutorialId)
        .single()
      
      if (data) {
        setTutorialData(data)
      }
    }
    
    checkTutorial()
    const interval = setInterval(checkTutorial, 2000)
    
    return () => clearInterval(interval)
  }, [tutorialId])
  
  const handleGenerate = async () => {
    if (!topic.trim()) return
    
    setError(null)
    setTutorialId(null)
    setTutorialData(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.details || data.error || 'Generation failed')
        }
        
        setTutorialId(data.id)
        setCategoryPath(data.categoryPath)
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error generating tutorial:', error)
        setError(errorMsg)
      }
    })
  }
  
  const isComplete = tutorialData?.status === 'ready'
  const lastStep = tutorialData?.tutorial_steps?.[tutorialData.tutorial_steps.length - 1]
  const previewImage = lastStep?.stored_image_url || lastStep?.image_url
  
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Generate Drawing Tutorial</h1>
      
      {!tutorialId && (
        <div className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium mb-2">
              What would you like to learn to draw?
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., cat, tree, house, cartoon dog"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isPending || !topic.trim()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Starting generation...' : 'Generate Tutorial'}
          </button>
        </div>
      )}
      
      {tutorialId && tutorialData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-2">{tutorialData.title || 'Generating...'}</h2>
            <p className="text-gray-600 mb-4">{tutorialData.intro || ''}</p>
            
            {!isComplete && (
              <GenerationProgress 
                totalSteps={tutorialData.total_steps || tutorialData.tutorial_steps?.length || 5}
                completedSteps={tutorialData.completed_steps || tutorialData.tutorial_steps?.length || 0}
                currentStep={tutorialData.current_step || 'generate_prompt'}
              />
            )}
            
            {isComplete && previewImage && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative w-full max-w-md mx-auto aspect-square mb-4">
                    <Image
                      src={previewImage}
                      alt="Final result"
                      fill
                      className="object-contain rounded-lg border"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />
                  </div>
                  <p className="text-green-600 font-medium mb-2">✓ Tutorial completed successfully!</p>
                  <p className="text-gray-600 text-sm mb-4">{tutorialData.outro}</p>
                </div>
                
                <div className="flex gap-4">
                  <Link
                    href={`${categoryPath}/${tutorialId}`}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition text-center"
                  >
                    View Tutorial
                  </Link>
                  <button
                    onClick={() => {
                      setTutorialId(null)
                      setTutorialData(null)
                      setTopic('')
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </main>
  )
}