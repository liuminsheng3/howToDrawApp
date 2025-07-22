// 智能构建累积提示词，确保图片连贯性

interface Step {
  step_number: number
  text: string
  image_prompt?: string
}

export function buildCumulativePrompt(steps: Step[], currentIndex: number, isImg2Img: boolean = false): string {
  // 从第一步提取主题
  const firstStepText = steps[0]?.text || ''
  const topicMatch = firstStepText.match(/draw (?:a |an )?(.+?)(?:\.|$)/i)
  const topic = topicMatch ? topicMatch[1] : 'drawing'
  
  // 收集到当前步骤为止的所有绘画元素
  const drawnElements: string[] = []
  
  for (let i = 0; i <= currentIndex; i++) {
    const stepText = steps[i].text.toLowerCase()
    
    // 智能提取每一步添加的内容
    // 步骤1通常是基础形状
    if (i === 0) {
      if (stepText.includes('circle')) {
        drawnElements.push('a circle')
      } else if (stepText.includes('oval')) {
        drawnElements.push('an oval')
      } else if (stepText.includes('square')) {
        drawnElements.push('a square')
      } else if (stepText.includes('triangle')) {
        drawnElements.push('a triangle')
      } else {
        // 提取其他基础形状
        const shapeMatch = stepText.match(/(?:draw|start with) (?:a |an )?(.+?)(?:\s+for|\s+as|\.)/i)
        if (shapeMatch) drawnElements.push(shapeMatch[1])
      }
    } else {
      // 后续步骤通常是添加细节
      // 提取"add"或"draw"后面的内容
      const addMatch = stepText.match(/(?:add|draw|create|make) (.+?)(?:\.|,|$)/i)
      if (addMatch) {
        let element = addMatch[1]
        // 清理常见的限定词
        element = element.replace(/^(?:a |an |the |two |three |four |some )/i, '')
        
        // 特殊处理复数和常见元素
        if (element.includes('ear') && !element.includes('ears')) element = 'ears'
        if (element.includes('eye') && !element.includes('eyes')) element = 'eyes'
        if (element.includes('leg') && !element.includes('legs')) element = 'legs'
        if (element.includes('whisker') && !element.includes('whiskers')) element = 'whiskers'
        
        // 避免重复
        if (!drawnElements.some(e => e.includes(element))) {
          drawnElements.push(element)
        }
      }
    }
  }
  
  // 构建描述
  let prompt = ''
  
  if (currentIndex === 0) {
    // 第一步：只有基础形状
    prompt = `Simple line drawing tutorial step 1: ${drawnElements[0] || 'basic shape'}`
  } else if (isImg2Img) {
    // img2img模式：强调要添加的新元素
    const currentStepElement = drawnElements[drawnElements.length - 1]
    prompt = `Add ${currentStepElement} to the existing drawing, keep all previous elements intact, simple line art style`
  } else {
    // 常规模式：描述完整的图像
    prompt = `Simple line drawing tutorial step ${currentIndex + 1}: ${topic} with `
    
    // 智能组合元素
    if (drawnElements.length === 1) {
      prompt += drawnElements[0]
    } else if (drawnElements.length === 2) {
      prompt += `${drawnElements[0]} and ${drawnElements[1]}`
    } else {
      const lastElement = drawnElements[drawnElements.length - 1]
      const otherElements = drawnElements.slice(0, -1)
      prompt += `${otherElements.join(', ')}, and ${lastElement}`
    }
  }
  
  // 添加统一的风格描述
  if (!isImg2Img || currentIndex === 0) {
    prompt += '. Clean minimalist style, black line art only, white background, no shading, simple and clear for beginners'
  } else {
    // img2img模式：保持原有风格
    prompt += ', maintain the same clean line art style as the base image'
  }
  
  // 强调当前步骤的新增内容（仅在非img2img模式）
  if (currentIndex > 0 && !isImg2Img) {
    const currentStepAdd = steps[currentIndex].text.match(/(?:add|draw|create) (.+?)(?:\.|,|$)/i)
    if (currentStepAdd) {
      prompt += `. Emphasize the newly added ${currentStepAdd[1]}`
    }
  }
  
  return prompt
}

// 为特定主题优化提示词
export function optimizePromptForTopic(prompt: string, topic: string): string {
  const lowerTopic = topic.toLowerCase()
  
  // 动物类优化
  if (lowerTopic.includes('cat') || lowerTopic.includes('dog') || lowerTopic.includes('animal')) {
    return prompt.replace('simple and clear', 'simple cute style, friendly appearance')
  }
  
  // 物体类优化  
  if (lowerTopic.includes('house') || lowerTopic.includes('car') || lowerTopic.includes('building')) {
    return prompt.replace('simple and clear', 'simple geometric style, clear structure')
  }
  
  // 自然类优化
  if (lowerTopic.includes('tree') || lowerTopic.includes('flower') || lowerTopic.includes('plant')) {
    return prompt.replace('simple and clear', 'simple organic shapes, natural flow')
  }
  
  return prompt
}