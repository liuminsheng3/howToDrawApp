'use client'

import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import useSWR from 'swr'
import Image from 'next/image'

interface DebugParams {
  id: string
}

const fetcher = async (id: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*, tutorial_steps(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Sort steps by step_number
  if (data.tutorial_steps) {
    data.tutorial_steps.sort((a: any, b: any) => a.step_number - b.step_number)
  }
  
  return data
}

export default function DebugPage() {
  const params = useParams() as DebugParams
  const { id } = params

  const { data: tutorial, error, isLoading } = useSWR(
    id ? `debug-${id}` : null,
    () => fetcher(id)
  )

  if (isLoading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>
  if (!tutorial) return <div className="p-8">No tutorial found</div>

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug: {tutorial.title}</h1>
      
      <div className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Tutorial Info:</h2>
        <pre className="text-xs overflow-auto">
{JSON.stringify({
  id: tutorial.id,
  topic: tutorial.topic,
  status: tutorial.status,
  total_steps: tutorial.total_steps,
  completed_steps: tutorial.completed_steps,
  category: tutorial.category,
  subcategory: tutorial.subcategory,
  created_at: tutorial.created_at
}, null, 2)}
        </pre>
      </div>

      <h2 className="text-2xl font-bold mb-4">Steps Analysis:</h2>
      
      <div className="space-y-8">
        {tutorial.tutorial_steps?.map((step: any, index: number) => (
          <div key={step.id} className="border-2 border-gray-300 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Step {step.step_number}</h3>
                <p className="mb-4">{step.text || step.instructions}</p>
                
                <div className="bg-yellow-50 p-3 rounded mb-4">
                  <h4 className="font-semibold text-sm mb-1">Image Prompt Used:</h4>
                  <p className="text-xs text-gray-700 break-words">
                    {step.image_prompt}
                  </p>
                </div>
                
                {index > 0 && (
                  <div className="bg-blue-50 p-3 rounded">
                    <h4 className="font-semibold text-sm mb-1">Should include from previous steps:</h4>
                    <ul className="text-xs text-gray-700">
                      {tutorial.tutorial_steps.slice(0, index).map((prevStep: any) => (
                        <li key={prevStep.id}>• {prevStep.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Generated Image:</h4>
                {step.stored_image_url || step.image_url ? (
                  <div className="relative aspect-square border-2 border-gray-300 rounded">
                    <Image
                      src={step.stored_image_url || step.image_url}
                      alt={`Step ${step.step_number}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 flex items-center justify-center rounded">
                    <p className="text-gray-500">No image</p>
                  </div>
                )}
                
                {index > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold">连贯性检查：</p>
                    <p>这张图是否包含了上面列出的所有前置步骤的内容？</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-red-50 rounded-lg">
        <h3 className="font-bold text-red-800 mb-2">常见问题诊断：</h3>
        <ol className="text-sm space-y-2 text-red-700">
          <li>1. <strong>图片不连贯</strong>：检查image_prompt是否正确累积了前面的元素</li>
          <li>2. <strong>风格不一致</strong>：可能是每次生成都使用了不同的种子(seed)</li>
          <li>3. <strong>img2img未生效</strong>：检查服务器日志是否显示"Using img2img"</li>
          <li>4. <strong>内容丢失</strong>：strength参数可能需要调整（当前设置为0.4）</li>
        </ol>
      </div>
    </main>
  )
}