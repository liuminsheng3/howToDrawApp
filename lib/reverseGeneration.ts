import { generateImageV2 } from './replicateV2'

// 反向生成策略：先生成成品，然后逐步"分解"
export async function generateReverseSteps(topic: string, steps: any[]): Promise<string[]> {
  console.log('[Reverse Generation] Starting reverse generation for:', topic)
  
  const imageUrls: string[] = []
  
  try {
    // Step 1: 生成完整的成品图
    const finalPrompt = `Beautiful simple line drawing of ${topic}, clean black lines on white background, minimalist style, complete and polished drawing, suitable for beginners to learn`
    console.log('[Reverse Generation] Generating final complete image...')
    const finalImageUrl = await generateImageV2(finalPrompt)
    
    // 最后一步会是完整的成品
    imageUrls[steps.length - 1] = finalImageUrl
    
    // Step 2: 基于成品图，生成各个步骤
    // 从简单到复杂，但都基于同一个成品图
    for (let i = 0; i < steps.length - 1; i++) {
      const step = steps[i]
      console.log(`[Reverse Generation] Generating step ${i + 1}...`)
      
      // 构建提示词，让模型只显示到当前步骤的内容
      let stepPrompt = constructStepPrompt(topic, steps, i)
      
      // 使用成品图作为基础，但修改提示词来"隐藏"后续步骤的内容
      const stepImageUrl = await generateImageV2(stepPrompt, finalImageUrl)
      imageUrls[i] = stepImageUrl
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return imageUrls
    
  } catch (error) {
    console.error('[Reverse Generation] Error:', error)
    throw error
  }
}

// 构建每个步骤的提示词
function constructStepPrompt(topic: string, steps: any[], currentIndex: number): string {
  const elements: string[] = []
  
  // 收集到当前步骤为止应该显示的元素
  for (let i = 0; i <= currentIndex; i++) {
    const stepText = steps[i].text.toLowerCase()
    
    // 提取关键元素
    if (stepText.includes('circle') || stepText.includes('oval')) {
      elements.push('basic shape')
    }
    if (stepText.includes('ear')) {
      elements.push('ears')
    }
    if (stepText.includes('eye')) {
      elements.push('eyes')
    }
    if (stepText.includes('nose')) {
      elements.push('nose')
    }
    if (stepText.includes('mouth')) {
      elements.push('mouth')
    }
    if (stepText.includes('body')) {
      elements.push('body')
    }
    if (stepText.includes('leg')) {
      elements.push('legs')
    }
    if (stepText.includes('tail')) {
      elements.push('tail')
    }
    if (stepText.includes('whisker')) {
      elements.push('whiskers')
    }
  }
  
  // 构建提示词，强调只显示这些元素
  let prompt = `Simplified version of the drawing showing only: ${elements.join(', ')}. `
  prompt += `Hide or remove all other details. Keep the same style and position as the original. `
  prompt += `Clean black line drawing on white background, tutorial step ${currentIndex + 1}`
  
  return prompt
}

// 另一种策略：使用遮罩或强度控制
export async function generateWithMasking(topic: string, steps: any[]): Promise<string[]> {
  console.log('[Masking Generation] Starting masked generation for:', topic)
  
  const imageUrls: string[] = []
  
  // 先生成基础形状
  const basePrompt = `Simple geometric shapes for drawing ${topic}, very basic outline only, black lines on white background`
  const baseImageUrl = await generateImageV2(basePrompt)
  imageUrls[0] = baseImageUrl
  
  // 逐步添加细节，但使用较低的prompt_strength保持一致性
  let previousImageUrl = baseImageUrl
  
  for (let i = 1; i < steps.length; i++) {
    const step = steps[i]
    console.log(`[Masking Generation] Generating step ${i + 1}...`)
    
    // 使用累积提示词，但强调保持原有元素
    const addPrompt = `Keep everything from the previous image exactly as is, and add: ${step.text}. Maintain the same style and proportions.`
    
    // 这里需要在replicateV2中支持自定义prompt_strength
    const stepImageUrl = await generateImageV2(addPrompt, previousImageUrl)
    imageUrls[i] = stepImageUrl
    previousImageUrl = stepImageUrl
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return imageUrls
}