import Image from 'next/image'

type Step = {
  step_number: number
  text: string
  image_url: string
  stored_image_url?: string
}

interface StepViewerProps {
  steps: Step[]
}

export default function StepViewer({ steps }: StepViewerProps) {
  return (
    <div className="space-y-8">
      {steps.map((step) => (
        <div key={step.step_number} className="border-b pb-8 last:border-b-0">
          <h3 className="text-xl font-semibold mb-3">
            Step {step.step_number}
          </h3>
          <p className="text-gray-700 mb-4">{step.text}</p>
          {(step.stored_image_url || step.image_url) && (
            <div className="relative w-full max-w-md my-2 aspect-square">
              <Image
                src={step.stored_image_url || step.image_url}
                alt={`Step ${step.step_number}`}
                fill
                className="object-contain rounded-lg border"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}