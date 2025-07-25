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
        // Use stable-diffusion img2img
        console.log('[Replicate] Using stable-diffusion img2img with previous image:', previousImageUrl.substring(0, 50) + '...')
        generatePromise = replicate.run(
          "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          {
            input: {
              image: previousImageUrl,
              prompt: attemptPrompt,
              negative_prompt: "nsfw, nude, adult content, inappropriate, violent, scary, complex, detailed, shading, colors, gradient, realistic, photorealistic, 3d, shadows",
              prompt_strength: 0.5, // Keep 50% of original, add 50% new
              num_outputs: 1,
              scheduler: "K_EULER"
            }
          }
        )
      } else {
        // Use stable-diffusion for the first step
        console.log('[Replicate] Using stable-diffusion for initial image')
        generatePromise = replicate.run(
          "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
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
      const output = await Promise.race([generatePromise, timeoutPromise]) as any
      
      console.log('[Replicate] Generation completed in', Date.now() - startTime, 'ms')
      console.log('[Replicate] Output type:', typeof output)
      console.log('[Replicate] Output constructor:', output?.constructor?.name)
      
      // Handle different output formats from flux models
      let imageUrl: string | null = null
      
      // Check if it's a ReadableStream (Flux models may return this)
      if (output instanceof ReadableStream) {
        console.log('[Replicate] Got ReadableStream, converting to URL...')
        
        // Read the stream
        const reader = output.getReader()
        const chunks: Uint8Array[] = []
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }
          
          // Convert to blob and create object URL
          const blob = new Blob(chunks, { type: 'image/png' })
          // Note: This creates a local blob URL, which won't work across different requests
          // We need to handle this differently
          console.error('[Replicate] ReadableStream output needs different handling')
          throw new Error('Flux model returned ReadableStream - need to implement proper handling')
          
        } finally {
          reader.releaseLock()
        }
      } else if (output && typeof output === 'object' && 'url' in output) {
        // flux-kontext-max returns an object with url() method
        imageUrl = typeof output.url === 'function' ? output.url() : output.url
      } else if (Array.isArray(output) && output.length > 0) {
        // Some models return array of URLs
        const firstItem = output[0]
        if (typeof firstItem === 'string') {
          imageUrl = firstItem
        } else if (firstItem && typeof firstItem === 'object' && 'url' in firstItem) {
          imageUrl = typeof firstItem.url === 'function' ? firstItem.url() : firstItem.url
        }
      } else if (typeof output === 'string') {
        imageUrl = output
      }
      
      if (imageUrl) {
        console.log('[Replicate] Success! Returning image URL:', imageUrl)
        return imageUrl
      } else {
        console.error('[Replicate] Unexpected output format:', output)
        console.error('[Replicate] Output keys:', output && typeof output === 'object' ? Object.keys(output) : 'N/A')
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