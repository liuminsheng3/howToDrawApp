import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// 新版本：正确处理Flux模型输出
export async function generateImageV2(prompt: string, previousImageUrl?: string): Promise<string> {
  const optimizedPrompt = `${prompt}, clean minimalist style, black line art on pure white background, no shading, no colors, simple and clear for beginners to follow, educational drawing tutorial`
  
  console.log('[Replicate V2] Starting image generation...')
  console.log('[Replicate V2] Prompt:', optimizedPrompt.substring(0, 100) + '...')
  if (previousImageUrl) {
    console.log('[Replicate V2] Previous image:', previousImageUrl.substring(0, 50) + '...')
  }
  
  const startTime = Date.now()
  
  try {
    let output: any
    
    if (previousImageUrl) {
      // Use flux-kontext-max for img2img
      console.log('[Replicate V2] Using flux-kontext-max (img2img)...')
      
      output = await replicate.run(
        "black-forest-labs/flux-kontext-max:2bb25ce6a287841e5e56d9550c52bd3e343694ff1764cd0209151db8c2b5767f",
        {
          input: {
            prompt: optimizedPrompt,
            input_image: previousImageUrl,
            output_format: "png",
            guidance_scale: 3.5,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_quality: 80,
            prompt_strength: 0.8
          }
        }
      )
    } else {
      // Use flux-schnell for text2img
      console.log('[Replicate V2] Using flux-schnell (text2img)...')
      
      output = await replicate.run(
        "black-forest-labs/flux-schnell:bf53bdb9790f81490d01d741f3a8c8b593a34b06fcc19e7ba14e866e7a7c0153",
        {
          input: {
            prompt: optimizedPrompt,
            output_format: "png",
            aspect_ratio: "1:1",
            num_outputs: 1,
            output_quality: 80
          }
        }
      )
    }
    
    console.log('[Replicate V2] Generation completed in', Date.now() - startTime, 'ms')
    
    // According to Replicate docs, the output should be a URL string or array of URLs
    let imageUrl: string | null = null
    
    if (typeof output === 'string') {
      // Direct URL string
      imageUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      // Array of URLs
      imageUrl = output[0]
    } else if (output && typeof output === 'object') {
      // Check for common patterns
      if ('output' in output) {
        imageUrl = output.output
      } else if ('url' in output) {
        imageUrl = output.url
      } else if ('image' in output) {
        imageUrl = output.image
      } else {
        // Log the actual structure for debugging
        console.error('[Replicate V2] Unexpected object structure:', Object.keys(output))
        console.error('[Replicate V2] Full output:', JSON.stringify(output, null, 2))
      }
    }
    
    if (!imageUrl) {
      throw new Error(`Failed to extract image URL from output: ${JSON.stringify(output).substring(0, 200)}`)
    }
    
    console.log('[Replicate V2] Success! Image URL:', imageUrl)
    return imageUrl
    
  } catch (error: any) {
    console.error('[Replicate V2] Error:', error?.message || error)
    console.error('[Replicate V2] Error details:', error)
    throw error
  }
}