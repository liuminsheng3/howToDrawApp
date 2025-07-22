'use client'

import { useState, useEffect } from 'react'
import GenerationProgress from '@/components/GenerationProgress'

export default function TestPage() {
  const [scenario, setScenario] = useState('generating')
  const [completedSteps, setCompletedSteps] = useState(0)
  
  // 模拟不同的进度场景
  const scenarios = {
    generating: { total: 10, completed: 0, current: 'generate_prompt' },
    step5: { total: 10, completed: 5, current: 'generate_image_5' },
    step10: { total: 10, completed: 10, current: 'generate_image_10' },
    finalizing: { total: 10, completed: 11, current: 'finalize' },
    complete: { total: 10, completed: 12, current: 'finalize' }
  }
  
  // 自动进度模拟
  useEffect(() => {
    if (scenario === 'auto') {
      const interval = setInterval(() => {
        setCompletedSteps(prev => {
          if (prev >= 12) return 0
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [scenario])
  
  const currentScenario = scenario === 'auto' 
    ? { total: 10, completed: completedSteps, current: 
        completedSteps === 0 ? 'generate_prompt' :
        completedSteps <= 10 ? `generate_image_${completedSteps}` : 'finalize'
      }
    : scenarios[scenario as keyof typeof scenarios]
  
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">进度组件测试</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">选择测试场景：</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScenario('generating')}
            className={`px-4 py-2 rounded ${scenario === 'generating' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            开始生成 (0%)
          </button>
          <button
            onClick={() => setScenario('step5')}
            className={`px-4 py-2 rounded ${scenario === 'step5' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            第5步 (41%)
          </button>
          <button
            onClick={() => setScenario('step10')}
            className={`px-4 py-2 rounded ${scenario === 'step10' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            第10步 (83%)
          </button>
          <button
            onClick={() => setScenario('finalizing')}
            className={`px-4 py-2 rounded ${scenario === 'finalizing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            最终处理 (91%)
          </button>
          <button
            onClick={() => setScenario('complete')}
            className={`px-4 py-2 rounded ${scenario === 'complete' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            完成 (100%)
          </button>
          <button
            onClick={() => setScenario('auto')}
            className={`px-4 py-2 rounded ${scenario === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            自动演示
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">当前状态：</h3>
        <pre className="bg-gray-100 p-4 rounded">
{JSON.stringify({
  totalSteps: currentScenario.total,
  completedSteps: currentScenario.completed,
  currentStep: currentScenario.current,
  progress: Math.round((currentScenario.completed / (currentScenario.total + 2)) * 100) + '%'
}, null, 2)}
        </pre>
      </div>
      
      <GenerationProgress
        totalSteps={currentScenario.total}
        completedSteps={currentScenario.completed}
        currentStep={currentScenario.current}
      />
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">进度计算说明：</h3>
        <ul className="space-y-1 text-sm">
          <li>• 总任务数 = 步骤数(10) + 2 = 12</li>
          <li>• 任务1: AI生成教程结构</li>
          <li>• 任务2-11: 生成10个步骤的图片</li>
          <li>• 任务12: 最终处理</li>
          <li>• 进度 = 完成任务数 / 12 × 100%</li>
          <li className="text-red-600 font-medium">• 当完成第10个图片时(completed=10)，进度应该是 10/12 = 83%</li>
          <li className="text-green-600 font-medium">• 只有当completed=12时，进度才是100%</li>
        </ul>
      </div>
    </main>
  )
}