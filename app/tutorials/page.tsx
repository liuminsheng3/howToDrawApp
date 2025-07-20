'use client'

import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Link from 'next/link'
import TutorialCard from '@/components/TutorialCard'

const fetcher = async () => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export default function TutorialsPage() {
  const { data: tutorials, error, isLoading, mutate } = useSWR('tutorials', fetcher, {
    refreshInterval: 5000 // Refresh every 5 seconds
  })

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Drawing Tutorials</h1>
        <Link
          href="/generate"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Create New
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tutorials...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading tutorials</p>
        </div>
      )}

      {tutorials && tutorials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No tutorials yet. Create your first one!</p>
        </div>
      )}

      {tutorials && tutorials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <TutorialCard 
              key={tutorial.id} 
              tutorial={tutorial} 
              onDelete={() => mutate()}
            />
          ))}
        </div>
      )}
    </main>
  )
}