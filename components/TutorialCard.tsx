import Link from 'next/link'

type Tutorial = {
  id: string
  title: string
  intro: string
  outro: string
  created_at: string
}

interface TutorialCardProps {
  tutorial: Tutorial
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  return (
    <Link href={`/tutorials/${tutorial.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <h2 className="text-xl font-semibold mb-2">{tutorial.title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutorial.intro}</p>
        <p className="text-xs text-gray-500">
          {new Date(tutorial.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}