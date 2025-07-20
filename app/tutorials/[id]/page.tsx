'use client'

import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Link from 'next/link'
import StepViewer from '@/components/StepViewer'
import GenerationProgress from '@/components/GenerationProgress'

const fetcher = async (id: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export default function TutorialDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: tutorial, error, isLoading } = useSWR(
    id ? `tutorial-${id}` : null,
    () => fetcher(id),
    {
      refreshInterval: (data) => {
        // Refresh every 2 seconds if status is 'generating'
        if (data?.status === 'generating') return 2000
        // Refresh every 3 seconds if no steps yet
        if (!data?.tutorial_steps || data.tutorial_steps.length === 0) return 3000
        return 0
      }
    }
  )

  if (isLoading) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tutorial...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading tutorial</p>
          <Link href="/tutorials" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to tutorials
          </Link>
        </div>
      </main>
    )
  }

  if (!tutorial) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Tutorial not found</p>
          <Link href="/tutorials" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to tutorials
          </Link>
        </div>
      </main>
    )
  }

  const steps = tutorial.tutorial_steps || []
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number)

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/tutorials" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to tutorials
      </Link>

      <h1 className="text-3xl font-bold mb-4">{tutorial.title}</h1>
      
      {tutorial.intro && (
        <p className="text-gray-700 mb-8">{tutorial.intro}</p>
      )}

      {tutorial.status === 'generating' ? (
        <div className="space-y-6">
          <GenerationProgress 
            totalSteps={tutorial.total_steps || 5}
            completedSteps={tutorial.completed_steps || 0}
            currentStep={tutorial.current_step || 'generate_prompt'}
          />
          <div className="text-center py-8">
            <p className="text-gray-600">Your custom drawing tutorial is being generated...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few minutes while we create custom images for each step</p>
          </div>
        </div>
      ) : sortedSteps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No steps available</p>
        </div>
      ) : (
        <>
          <StepViewer steps={sortedSteps} />
          
          {tutorial.outro && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{tutorial.outro}</p>
            </div>
          )}
        </>
      )}
    </main>
  )
}