import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string, previousImageUrl?: string): Promise<string> {
  // Optimize prompt for better tutorial images
  const optimizedPrompt = `${prompt}, clean minimalist style, black line art on pure white background, no shading, no colors, simple and clear for beginners to follow, educational drawing tutorial`
  
  console.log('[Replicate] Starting image generation with prompt:', optimizedPrompt.substring(0, 50) + '...')
  const startTime = Date.now()
  
  // Try up to 3 times if NSFW error occurs
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Replicate timeout after 30 seconds')), 30000)
      })
      
      // Modify prompt on retry to avoid NSFW detection
      const attemptPrompt = attempt > 1 
        ? `Children's educational drawing tutorial: ${prompt.replace('Add', 'Gently add').replace('existing', 'current')}, simple black lines only, white background, family-friendly`
        : optimizedPrompt
      
      let generatePromise
      
      if (previousImageUrl) {
        // Use img2img for subsequent steps
        console.log('[Replicate] Using img2img with previous image:', previousImageUrl.substring(0, 50) + '...')
        generatePromise = replicate.run(
          "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
          {
            input: {
              image: previousImageUrl,
              prompt: attemptPrompt,
              negative_prompt: "nsfw, nude, adult content, inappropriate, violent, scary, complex, detailed, shading, colors, gradient, realistic, photorealistic, 3d, shadows",
              strength: 0.4, // Keep 60% of original image, modify 40%
              num_outputs: 1,
              num_inference_steps: 30,
              guidance_scale: 7.5,
              scheduler: "K_EULER"
            }
          }
        )
      } else {
        // Use text2img for the first step
        console.log('[Replicate] Using text2img for initial image')
        generatePromise = replicate.run(
          "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          {
            input: {
              prompt: attemptPrompt,
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
    
      console.log(`[Replicate] Attempt ${attempt} - Waiting for image generation...`)
      const output = await Promise.race([generatePromise, timeoutPromise])
      
      console.log('[Replicate] Generation completed in', Date.now() - startTime, 'ms')
      console.log('[Replicate] Output type:', typeof output, 'isArray:', Array.isArray(output))
      
      if (Array.isArray(output) && output.length > 0) {
        console.log('[Replicate] Success! Returning first image URL:', output[0])
        return output[0]
      } else if (typeof output === 'string') {
        console.log('[Replicate] Success! Returning string URL:', output)
        return output
      } else {
        console.error('[Replicate] Unexpected output:', output)
        throw new Error('Unexpected output format from Replicate')
      }
    } catch (error: any) {
      console.error(`[Replicate] Attempt ${attempt} failed:`, error?.message || error)
      
      // If NSFW error and not last attempt, retry
      if (error?.message?.includes('NSFW') && attempt < 3) {
        console.log(`[Replicate] NSFW detected, retrying with safer prompt (attempt ${attempt + 1}/3)...`)
        continue
      }
      
      // If last attempt or non-NSFW error, throw
      if (attempt === 3) {
        throw new Error(`Failed after 3 attempts: ${error?.message || 'Unknown error'}`)
      } else {
        throw error
      }
    }
  }
  
  throw new Error('Failed to generate image after all attempts')
}