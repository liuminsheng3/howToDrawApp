import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('[Test Replicate] Starting test...')
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  })
  
  try {
    // Test with a simple prompt
    console.log('[Test Replicate] Running stable diffusion test...')
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: "A simple black and white line drawing of a cat",
          width: 512,
          height: 512,
          num_outputs: 1
        }
      }
    )
    
    console.log('[Test Replicate] Output:', output)
    
    return NextResponse.json({
      success: true,
      output: output,
      outputType: typeof output,
      isArray: Array.isArray(output),
      firstUrl: Array.isArray(output) ? output[0] : output
    })
  } catch (error) {
    console.error('[Test Replicate] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: error
    }, { status: 500 })
  }
}