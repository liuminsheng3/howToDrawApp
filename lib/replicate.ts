import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string, previousImageUrl?: string): Promise<string> {
  // Optimize prompt for better tutorial images
  const optimizedPrompt = `${prompt}, clean minimalist style, black line art on pure white background, no shading, no colors, simple and clear for beginners to follow, educational drawing tutorial`
  
  console.log('[Replicate] Starting image generation with prompt:', optimizedPrompt.substring(0, 50) + '...')
  const startTime = Date.now()
  
  // Try up to 3 times if error occurs
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Replicate timeout after 30 seconds')), 30000)
      })
      
      // Modify prompt on retry
      const attemptPrompt = attempt > 1 
        ? `Children's educational drawing tutorial: ${prompt.replace('Add', 'Gently add').replace('existing', 'current')}, simple black lines only, white background, family-friendly`
        : optimizedPrompt
      
      let generatePromise
      
      if (previousImageUrl) {
        // Use flux-kontext-max with previous image
        console.log('[Replicate] Using flux-kontext-max with previous image:', previousImageUrl.substring(0, 50) + '...')
        generatePromise = replicate.run(
          "black-forest-labs/flux-kontext-max:2bb25ce6a287841e5e56d9550c52bd3e343694ff1764cd0209151db8c2b5767f",
          {
            input: {
              prompt: attemptPrompt,
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
        // Use flux for the first step (text to image)
        console.log('[Replicate] Using flux for initial image')
        generatePromise = replicate.run(
          "black-forest-labs/flux-schnell:bf53bdb9790f81490d01d741f3a8c8b593a34b06fcc19e7ba14e866e7a7c0153",
          {
            input: {
              prompt: attemptPrompt,
              output_format: "png",
              aspect_ratio: "1:1",
              num_outputs: 1,
              output_quality: 80
            }
          }
        )
      }
    
      console.log(`[Replicate] Attempt ${attempt} - Waiting for image generation...`)
      const output = await Promise.race([generatePromise, timeoutPromise]) as any
      
      console.log('[Replicate] Generation completed in', Date.now() - startTime, 'ms')
      console.log('[Replicate] Output type:', typeof output)
      
      // Handle different output formats from flux models
      let imageUrl: string | null = null
      
      if (output && typeof output === 'object' && 'url' in output) {
        // flux-kontext-max returns an object with url() method
        imageUrl = typeof output.url === 'function' ? output.url() : output.url
      } else if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0]
      } else if (typeof output === 'string') {
        imageUrl = output
      }
      
      if (imageUrl) {
        console.log('[Replicate] Success! Returning image URL:', imageUrl)
        return imageUrl
      } else {
        console.error('[Replicate] Unexpected output format:', output)
        throw new Error('Unexpected output format from Replicate')
      }
    } catch (error: any) {
      console.error(`[Replicate] Attempt ${attempt} failed:`, error?.message || error)
      
      // Retry on any error if not last attempt
      if (attempt < 3) {
        console.log(`[Replicate] Error occurred, retrying (attempt ${attempt + 1}/3)...`)
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