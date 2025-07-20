import { CheckCircle, Clock, Loader2 } from 'lucide-react'

interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface GenerationProgressProps {
  totalSteps: number
  completedSteps: number
  currentStep: string
}

export default function GenerationProgress({ 
  totalSteps, 
  completedSteps, 
  currentStep 
}: GenerationProgressProps) {
  // Generate step list based on total steps
  const generateStepList = (): GenerationStep[] => {
    const steps: GenerationStep[] = [
      {
        id: 'generate_prompt',
        label: 'Generating tutorial structure with AI',
        status: completedSteps >= 1 ? 'completed' : currentStep === 'generate_prompt' ? 'in_progress' : 'pending'
      }
    ]

    // Add image generation steps
    for (let i = 1; i <= totalSteps; i++) {
      const stepIndex = i + 1
      steps.push({
        id: `generate_image_${i}`,
        label: `Generating image for step ${i}`,
        status: completedSteps >= stepIndex ? 'completed' : 
                currentStep === `generate_image_${i}` ? 'in_progress' : 'pending'
      })
    }

    // Final step - updating status
    steps.push({
      id: 'finalize',
      label: 'Finalizing tutorial',
      status: completedSteps >= totalSteps + 2 ? 'completed' : 
              currentStep === 'finalize' ? 'in_progress' : 'pending'
    })

    return steps
  }

  const steps = generateStepList()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : step.status === 'in_progress' ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                step.status === 'completed' ? 'text-green-700 font-medium' : 
                step.status === 'in_progress' ? 'text-blue-700 font-medium' : 
                'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium">{Math.round((completedSteps / (totalSteps + 2)) * 100)}%</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps / (totalSteps + 2)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}