import { NextResponse } from 'next/server'

// 测试端点，用于验证前端逻辑
export async function GET() {
  // 模拟教程数据
  const mockTutorial = {
    id: 'test-123',
    topic: 'cat',
    title: 'How to Draw a Cat',
    intro: 'Learn to draw a cute cat step by step',
    outro: 'Great job! You have learned to draw a cat',
    status: 'ready',
    category: 'animal',
    subcategory: 'cats',
    total_steps: 10,
    completed_steps: 12, // 10 + 2
    current_step: 'finalize',
    created_at: new Date().toISOString(),
    tutorial_steps: Array.from({ length: 10 }, (_, i) => ({
      id: `step-${i + 1}`,
      tutorial_id: 'test-123',
      step_number: i + 1,
      text: `Step ${i + 1}: Draw the cat's ${['head', 'ears', 'eyes', 'nose', 'mouth', 'body', 'front legs', 'back legs', 'tail', 'details'][i]}`,
      image_prompt: `Simple line drawing of cat step ${i + 1}`,
      image_url: `https://via.placeholder.com/400x400/cccccc/666666?text=Step+${i + 1}`,
      stored_image_url: `https://via.placeholder.com/400x400/cccccc/666666?text=Step+${i + 1}`
    }))
  }

  return NextResponse.json({
    tutorial: mockTutorial,
    message: 'This is test data for local development'
  })
}
