import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">How to Draw - AI Tutorial Generator</h1>
      <div className="flex gap-4">
        <Link
          href="/generate"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Generate New Tutorial
        </Link>
        <Link
          href="/tutorials"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          Browse Tutorials
        </Link>
      </div>
    </main>
  )
}