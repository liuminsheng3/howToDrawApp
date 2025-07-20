'use client'

import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Link from 'next/link'
import TutorialCard from '@/components/TutorialCard'

interface PageParams {
  category: string
}

const subcategoriesByCategory: Record<string, { name: string; path: string }[]> = {
  animal: [
    { name: 'Cats', path: 'cats' },
    { name: 'Dogs', path: 'dogs' },
    { name: 'Birds', path: 'birds' },
    { name: 'Fish', path: 'fish' }
  ],
  nature: [
    { name: 'Trees', path: 'trees' },
    { name: 'Flowers', path: 'flowers' },
    { name: 'Landscapes', path: 'landscapes' }
  ],
  object: [
    { name: 'Vehicles', path: 'vehicles' },
    { name: 'Buildings', path: 'buildings' },
    { name: 'Food', path: 'food' }
  ],
  people: [
    { name: 'Portraits', path: 'portraits' },
    { name: 'Characters', path: 'characters' }
  ]
}

const fetcher = async (category: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .eq('category', category)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export default function CategoryPage() {
  const params = useParams() as PageParams
  const { category } = params

  const { data: tutorials, error, isLoading, mutate } = useSWR(
    category,
    () => fetcher(category)
  )

  const subcategories = subcategoriesByCategory[category] || []
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-500 hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{categoryTitle}</span>
      </nav>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{categoryTitle} Drawing Tutorials</h1>
        <Link
          href="/generate"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Create New
        </Link>
      </div>

      {/* Subcategory navigation */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Browse by subcategory:</h2>
        <div className="flex flex-wrap gap-3">
          {subcategories.map((sub) => (
            <Link
              key={sub.path}
              href={`/${category}/${sub.path}`}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              {sub.name}
            </Link>
          ))}
        </div>
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
          <p className="text-gray-600">No {categoryTitle.toLowerCase()} tutorials yet.</p>
          <Link href="/generate" className="text-blue-500 hover:underline mt-2 inline-block">
            Create the first one!
          </Link>
        </div>
      )}

      {tutorials && tutorials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">All {categoryTitle} Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="cursor-pointer">
                <Link href={`/${category}/${tutorial.subcategory}/${tutorial.id}`}>
                  <TutorialCard 
                    tutorial={tutorial} 
                    onDelete={() => mutate()}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}