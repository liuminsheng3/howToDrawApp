import { generateImageV2 } from './replicateV2'

// 渐进式生成策略：确保每一步都基于前一步构建
export async function generateProgressiveSteps(topic: string, steps: any[]): Promise<string[]> {
  console.log('[Progressive Generation] Starting for:', topic)
  
  const imageUrls: string[] = []
  
  // 核心策略：使用img2img确保连续性
  let previousImageUrl: string | null = null
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    console.log(`[Progressive Generation] Generating step ${i + 1}/${steps.length}...`)
    
    // 构建非常具体的提示词
    let prompt = ''
    
    if (i === 0) {
      // 第一步：只画最基础的形状
      prompt = `Step 1 of drawing tutorial: Draw ONLY one simple shape (circle or oval) for ${topic}. Black line on white background. Nothing else, just ONE basic shape. Minimalist, clean, educational.`
    } else if (i === steps.length - 1) {
      // 最后一步：完整的简笔画
      prompt = `Final step of drawing tutorial: Complete simple line drawing of ${topic}. Black lines only, white background, very simple cartoon style, suitable for children to copy.`
    } else {
      // 中间步骤：明确说明要添加什么
      const stepInstruction = extractAddition(step.text)
      if (previousImageUrl) {
        // 使用img2img，保持前一步的内容并添加新元素
        prompt = `Drawing tutorial step ${i + 1}: Take the existing drawing and ADD ${stepInstruction}. Keep all previous elements visible, only ADD new parts. Black lines on white background.`
      } else {
        prompt = `Drawing tutorial step ${i + 1}: ${stepInstruction}. Simple black line drawing on white background.`
      }
    }
    
    try {
      let imageUrl: string
      
      if (i === 0 || !previousImageUrl) {
        // 第一步或没有前一步图片时，使用text2img
        imageUrl = await generateImageV2(prompt)
      } else {
        // 使用img2img，基于前一步构建
        // 使用较高的prompt_strength来确保添加新元素
        imageUrl = await generateImageV2(prompt, previousImageUrl, { promptStrength: 0.7 })
      }
      
      imageUrls.push(imageUrl)
      previousImageUrl = imageUrl
      
      // 避免API限制
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    } catch (error) {
      console.error(`[Progressive Generation] Error on step ${i + 1}:`, error)
      // 如果失败，使用占位图
      imageUrls.push('https://via.placeholder.com/768x768/ffffff/000000?text=Step+' + (i + 1))
    }
  }
  
  return imageUrls
}

// 从步骤文本中提取要添加的内容
function extractAddition(stepText: string): string {
  const text = stepText.toLowerCase()
  
  // 常见的添加模式
  if (text.includes('add')) {
    const addMatch = text.match(/add\s+(.+?)(?:\.|$)/i)
    if (addMatch) return addMatch[1]
  }
  
  if (text.includes('draw')) {
    const drawMatch = text.match(/draw\s+(.+?)(?:\.|$)/i)
    if (drawMatch) return drawMatch[1]
  }
  
  // 返回清理后的文本
  return stepText.replace(/^(step \d+:|now|next|then)/i, '').trim()
}

// 备选方案：使用ControlNet或特定的教程模型
export async function generateWithControlNet(topic: string, steps: any[]): Promise<string[]> {
  console.log('[ControlNet Generation] Starting for:', topic)
  
  // 这需要使用支持ControlNet的模型
  // 例如：canny edge detection 来保持形状一致性
  
  const imageUrls: string[] = []
  
  // TODO: 实现ControlNet方案
  // 1. 生成第一个基础形状
  // 2. 使用edge detection提取轮廓
  // 3. 基于轮廓生成下一步，添加新元素
  // 4. 重复直到完成
  
  return imageUrls
}

// 方案3：使用SVG路径逐步构建
export async function generateSVGProgressive(topic: string, steps: any[]): Promise<string[]> {
  console.log('[SVG Progressive] Starting for:', topic)
  
  // 这个方案可以精确控制每一步
  // 1. 为每个步骤定义SVG路径
  // 2. 逐步添加路径元素
  // 3. 转换为图片
  
  const svgPaths: string[] = []
  
  // TODO: 实现SVG渐进式生成
  
  return []
}