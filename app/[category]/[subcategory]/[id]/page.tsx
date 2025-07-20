'use client'

import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Link from 'next/link'
import StepViewer from '@/components/StepViewer'

interface PageParams {
  category: string
  subcategory: string
  id: string
}

const fetcher = async (id: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export default function TutorialViewPage() {
  const params = useParams() as PageParams
  const { category, subcategory, id } = params

  const { data: tutorial, error, isLoading } = useSWR(
    id ? `tutorial-${id}` : null,
    () => fetcher(id)
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

  if (error || !tutorial) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading tutorial</p>
          <Link href={`/${category}/${subcategory}`} className="text-blue-500 hover:underline mt-4 inline-block">
            Back to {subcategory}
          </Link>
        </div>
      </main>
    )
  }

  const steps = tutorial.tutorial_steps || []
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number)

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-500 hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${category}`} className="text-blue-500 hover:underline capitalize">{category}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${category}/${subcategory}`} className="text-blue-500 hover:underline capitalize">{subcategory}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{tutorial.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-4">{tutorial.title}</h1>
      
      {tutorial.intro && (
        <p className="text-gray-700 mb-8">{tutorial.intro}</p>
      )}

      <StepViewer steps={sortedSteps} />
      
      {tutorial.outro && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{tutorial.outro}</p>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link 
          href={`/${category}/${subcategory}`}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← More {subcategory} tutorials
        </Link>
        <Link 
          href="/generate"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Generate New Tutorial
        </Link>
      </div>
    </main>
  )
}