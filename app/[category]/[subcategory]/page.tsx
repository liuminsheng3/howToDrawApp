'use client'

import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Link from 'next/link'
import TutorialCard from '@/components/TutorialCard'

const fetcher = async (category: string, subcategory: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .eq('category', category)
    .eq('subcategory', subcategory)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export default function SubcategoryPage() {
  const params = useParams<{ category: string; subcategory: string }>()
  const { category, subcategory } = params

  const { data: tutorials, error, isLoading, mutate } = useSWR(
    [category, subcategory],
    () => fetcher(category, subcategory)
  )

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
  const subcategoryTitle = subcategory.charAt(0).toUpperCase() + subcategory.slice(1)

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-500 hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${category}`} className="text-blue-500 hover:underline">{categoryTitle}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{subcategoryTitle}</span>
      </nav>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{subcategoryTitle} Drawing Tutorials</h1>
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
          <p className="text-gray-600">No {subcategoryTitle.toLowerCase()} tutorials yet.</p>
          <Link href="/generate" className="text-blue-500 hover:underline mt-2 inline-block">
            Create the first one!
          </Link>
        </div>
      )}

      {tutorials && tutorials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="cursor-pointer">
              <Link href={`/${category}/${subcategory}/${tutorial.id}`}>
                <TutorialCard 
                  tutorial={tutorial} 
                  onDelete={() => mutate()}
                />
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}