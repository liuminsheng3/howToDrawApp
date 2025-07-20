'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePage() {
  const [topic, setTopic] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const router = useRouter()
  
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`])
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    
    setError(null)
    setDebugInfo([])

    startTransition(async () => {
      try {
        addDebugInfo('Starting tutorial generation...')
        addDebugInfo(`Topic: "${topic}"`)
        
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })
        
        addDebugInfo(`Response status: ${response.status}`)

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.details || data.error || 'Generation failed')
        }
        
        addDebugInfo(`Tutorial ID: ${data.id}`)
        addDebugInfo('Redirecting to tutorial page...')
        
        router.push(`/tutorials/${data.id}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error generating tutorial:', error)
        setError(errorMsg)
        addDebugInfo(`Error: ${errorMsg}`)
      }
    })
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Generate Drawing Tutorial</h1>
      
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
          {isPending ? 'Generating...' : 'Generate Tutorial'}
        </button>

        {isPending && (
          <div className="space-y-2">
            <p className="text-gray-600 text-center">
              This may take a minute while we create your custom tutorial...
            </p>
            <p className="text-xs text-gray-500 text-center">
              Check the browser console for detailed logs
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {debugInfo.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Debug Info:</p>
            <div className="space-y-1">
              {debugInfo.map((info, i) => (
                <p key={i} className="text-xs text-gray-600 font-mono">{info}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}