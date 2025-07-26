import { generateImageV2 } from './replicateV2'

// 一致性生成策略：确保所有步骤风格统一
export async function generateConsistentSteps(topic: string, steps: any[]): Promise<string[]> {
  console.log('[Consistent Generation] Starting for:', topic)
  
  const imageUrls: string[] = []
  
  // 定义统一的风格参数
  const styleGuide = `minimalist black line drawing, thin clean lines, white background, no shading, no details, geometric shapes, professional tutorial style`
  
  try {
    // 第一种方法：先生成最终效果作为参考
    console.log('[Consistent Generation] Generating reference final image...')
    const finalPrompt = `Complete simple line drawing of ${topic}, ${styleGuide}, showing all features in the simplest form possible`
    const referenceImage = await generateImageV2(finalPrompt)
    
    // 为每个步骤生成图片，但都基于相同的风格指南
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`[Consistent Generation] Generating step ${i + 1}/${steps.length}...`)
      
      let stepPrompt = ''
      
      if (i === 0) {
        // 第一步：只有基础形状
        stepPrompt = `Tutorial step 1: Only draw the basic shape for ${topic}. Just one or two simple geometric shapes (circle, oval, or square). ${styleGuide}. Nothing else, completely minimal.`
      } else if (i === steps.length - 1) {
        // 最后一步：使用之前生成的参考图
        imageUrls[i] = referenceImage
        continue
      } else {
        // 中间步骤：累积添加元素
        const elementsToShow = extractElementsUpToStep(steps, i)
        stepPrompt = `Tutorial step ${i + 1}: Draw ${topic} with only these elements: ${elementsToShow.join(', ')}. ${styleGuide}. Keep it extremely simple, no extra details.`
      }
      
      const stepImage = await generateImageV2(stepPrompt)
      imageUrls[i] = stepImage
      
      // 避免API限制
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }
    
    return imageUrls
    
  } catch (error) {
    console.error('[Consistent Generation] Error:', error)
    throw error
  }
}

// 提取到某一步为止的所有元素
function extractElementsUpToStep(steps: any[], upToIndex: number): string[] {
  const elements: string[] = []
  const seen = new Set<string>()
  
  for (let i = 0; i <= upToIndex; i++) {
    const stepText = steps[i].text.toLowerCase()
    
    // 基础形状
    if (i === 0) {
      if (stepText.includes('circle')) elements.push('a circle')
      else if (stepText.includes('oval')) elements.push('an oval')
      else if (stepText.includes('square')) elements.push('a square')
      else if (stepText.includes('triangle')) elements.push('a triangle')
      else elements.push('basic shape')
    } else {
      // 提取新增的元素
      const patterns = [
        { regex: /\b(ears?)\b/i, element: 'ears' },
        { regex: /\b(eyes?)\b/i, element: 'eyes' },
        { regex: /\b(nose)\b/i, element: 'nose' },
        { regex: /\b(mouth)\b/i, element: 'mouth' },
        { regex: /\b(body)\b/i, element: 'body' },
        { regex: /\b(legs?)\b/i, element: 'legs' },
        { regex: /\b(tail)\b/i, element: 'tail' },
        { regex: /\b(whiskers?)\b/i, element: 'whiskers' },
        { regex: /\b(wings?)\b/i, element: 'wings' },
        { regex: /\b(feet|paws?)\b/i, element: 'feet' }
      ]
      
      for (const { regex, element } of patterns) {
        if (regex.test(stepText) && !seen.has(element)) {
          elements.push(element)
          seen.add(element)
        }
      }
    }
  }
  
  return elements
}

// 第二种方法：使用固定的种子确保一致性
export async function generateWithSeed(topic: string, steps: any[]): Promise<string[]> {
  console.log('[Seed Generation] Starting with fixed seed for:', topic)
  
  const imageUrls: string[] = []
  const seed = Math.floor(Math.random() * 1000000) // 为这个教程生成一个固定种子
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    console.log(`[Seed Generation] Generating step ${i + 1} with seed ${seed}...`)
    
    // 构建累积的元素列表
    const elements = extractElementsUpToStep(steps, i)
    
    // 使用固定种子和非常具体的提示词
    const prompt = `Tutorial step ${i + 1} of ${steps.length}: Simple line drawing showing ${elements.join(', ')} for ${topic}. Black lines only, white background, no shading, geometric style. Seed: ${seed}`
    
    const stepImage = await generateImageV2(prompt)
    imageUrls[i] = stepImage
    
    if (i < steps.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }
  
  return imageUrls
}