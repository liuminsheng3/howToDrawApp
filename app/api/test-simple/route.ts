import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'No API token' }, { status: 500 })
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    console.log('[Simple Test] Starting...')
    
    // Simple test with stable diffusion
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: "A simple black circle on white background",
          width: 512,
          height: 512,
          num_outputs: 1
        }
      }
    )
    
    console.log('[Simple Test] Raw output:', output)
    console.log('[Simple Test] Output type:', typeof output)
    console.log('[Simple Test] Is array?', Array.isArray(output))
    
    // Extract URL
    let imageUrl = null
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0]
    } else if (typeof output === 'string') {
      imageUrl = output
    }
    
    return NextResponse.json({
      success: true,
      imageUrl,
      rawOutput: output
    })
    
  } catch (error: any) {
    console.error('[Simple Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      details: error
    }, { status: 500 })
  }
}