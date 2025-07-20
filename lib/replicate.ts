import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string): Promise<string> {
  // Add safety prefix to avoid NSFW false positives
  const safePrompt = `Safe for work, educational drawing tutorial: ${prompt}. Simple line art style, appropriate for all ages.`
  
  console.log('[Replicate] Starting image generation with prompt:', safePrompt.substring(0, 50) + '...')
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
        ? `Educational children's drawing guide: ${prompt}. Clean, simple illustration.`
        : safePrompt
      
      const generatePromise = replicate.run(
        "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        {
          input: {
            prompt: attemptPrompt,
            negative_prompt: "nsfw, nude, adult content, inappropriate, violent, scary",
            width: 768,
            height: 768,
            num_outputs: 1,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            scheduler: "K_EULER"
          }
        }
      )
    
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