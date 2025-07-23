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
      // Use stable-diffusion img2img
      console.log('[Replicate V2] Using stable-diffusion (img2img)...')
      
      output = await replicate.run(
        "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        {
          input: {
            image: previousImageUrl,
            prompt: optimizedPrompt,
            negative_prompt: "nsfw, nude, adult content, inappropriate, violent, scary, complex, detailed, shading, colors, gradient, realistic, photorealistic, 3d, shadows",
            prompt_strength: 0.5,
            num_outputs: 1,
            scheduler: "K_EULER"
          }
        }
      )
    } else {
      // Use stable-diffusion for text2img
      console.log('[Replicate V2] Using stable-diffusion (text2img)...')
      
      output = await replicate.run(
        "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        {
          input: {
            prompt: optimizedPrompt,
            negative_prompt: "nsfw, nude, adult content, inappropriate, violent, scary, complex, detailed, shading, colors, gradient, realistic, photorealistic, 3d, shadows",
            width: 768,
            height: 768,
            num_outputs: 1,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            scheduler: "K_EULER"
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