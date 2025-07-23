'use client'

import Image from 'next/image'
import { useState } from 'react'

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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (stepNumber: number) => {
    setImageErrors(prev => ({ ...prev, [stepNumber]: true }))
  }

  return (
    <div className="space-y-8">
      {steps.map((step) => {
        const imageUrl = step.stored_image_url || step.image_url
        const hasError = imageErrors[step.step_number]
        
        return (
          <div key={step.step_number} className="border-b pb-8 last:border-b-0">
            <h3 className="text-xl font-semibold mb-3">
              Step {step.step_number}
            </h3>
            <p className="text-gray-700 mb-4">{step.text}</p>
            
            {imageUrl && (
              <div className="relative w-full max-w-md my-2 aspect-square bg-gray-100 rounded-lg">
                {!hasError ? (
                  <Image
                    src={imageUrl}
                    alt={`Step ${step.step_number}`}
                    fill
                    className="object-contain rounded-lg border"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => handleImageError(step.step_number)}
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <p className="mb-2">图片加载失败</p>
                    <a 
                      href={imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      直接查看图片
                    </a>
                    <p className="text-xs mt-2 px-4 text-center break-all">
                      {imageUrl}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {!imageUrl && (
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <p>暂无图片</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}