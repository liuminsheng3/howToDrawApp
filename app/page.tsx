import Link from 'next/link'

export default function Home() {
  const categories = [
    {
      name: 'Animals',
      path: '/animal',
      description: 'Learn to draw various animals',
      subcategories: ['cats', 'dogs', 'birds', 'fish']
    },
    {
      name: 'Nature',
      path: '/nature',
      description: 'Draw natural scenes and objects',
      subcategories: ['trees', 'flowers', 'landscapes']
    },
    {
      name: 'Objects',
      path: '/object',
      description: 'Everyday objects and items',
      subcategories: ['vehicles', 'buildings', 'food']
    },
    {
      name: 'People',
      path: '/people',
      description: 'Human figures and characters',
      subcategories: ['portraits', 'characters']
    }
  ]

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How to Draw - AI Tutorial Generator</h1>
        <p className="text-gray-600 mb-8">Learn to draw anything with step-by-step AI-generated tutorials</p>
        <Link
          href="/generate"
          className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition text-lg font-medium"
        >
          Generate New Tutorial
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.path}
              href={category.path}
              className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600 mb-3">{category.description}</p>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/tutorials"
          className="text-blue-500 hover:underline"
        >
          View all tutorials →
        </Link>
      </div>
    </main>
  )
}