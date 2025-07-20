import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string): Promise<string> {
  console.log('[Replicate] Starting image generation with prompt:', prompt.substring(0, 50) + '...')
  const startTime = Date.now()
  
  try {
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Replicate timeout after 30 seconds')), 30000)
    })
    
    const generatePromise = replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: prompt,
          width: 768,
          height: 768,
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "K_EULER"
        }
      }
    )
    
    console.log('[Replicate] Waiting for image generation...')
    const output = await Promise.race([generatePromise, timeoutPromise])
    
    console.log('[Replicate] Generation completed in', Date.now() - startTime, 'ms')
    console.log('[Replicate] Output type:', typeof output, 'isArray:', Array.isArray(output))
    
    if (Array.isArray(output) && output.length > 0) {
      console.log('[Replicate] Returning first image URL:', output[0])
      return output[0]
    } else if (typeof output === 'string') {
      console.log('[Replicate] Returning string URL:', output)
      return output
    } else {
      console.error('[Replicate] Unexpected output:', output)
      throw new Error('Unexpected output format from Replicate')
    }
  } catch (error) {
    console.error('[Replicate] Error generating image:', error)
    throw error
  }
}