'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePage() {
  const [topic, setTopic] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleGenerate = async () => {
    if (!topic.trim()) return

    startTransition(async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) throw new Error('Generation failed')
        
        const { id } = await response.json()
        router.push(`/tutorials/${id}`)
      } catch (error) {
        console.error('Error generating tutorial:', error)
        alert('Failed to generate tutorial. Please try again.')
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
          <p className="text-gray-600 text-center">
            This may take a minute while we create your custom tutorial...
          </p>
        )}
      </div>
    </main>
  )
}