import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('[Test Replicate] Starting Flux model test...')
  
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'REPLICATE_API_TOKEN not configured'
    }, { status: 500 })
  }
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  })
  
  try {
    // Test 1: stable-diffusion (text to image)
    console.log('[Test] Running stable-diffusion test...')
    const output1 = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: "Simple line drawing of a circle, black lines on white background",
          negative_prompt: "complex, detailed, shading, colors",
          width: 768,
          height: 768,
          num_outputs: 1
        }
      }
    )
    
    console.log('[Test] flux-schnell output:', output1)
    console.log('[Test] Output type:', typeof output1)
    console.log('[Test] Is ReadableStream?', output1 instanceof ReadableStream)
    
    // Handle different output types
    let imageUrl1 = null
    if (output1 && typeof output1 === 'object') {
      // Check if it's a ReadableStream or has a url method
      if ('url' in output1 && typeof output1.url === 'function') {
        imageUrl1 = output1.url()
      } else if ('url' in output1) {
        imageUrl1 = output1.url
      } else if (output1 instanceof ReadableStream) {
        // If it's a stream, we need to handle it differently
        return NextResponse.json({
          success: false,
          error: 'Got ReadableStream instead of URL - need to handle differently',
          outputType: 'ReadableStream'
        })
      }
    } else if (Array.isArray(output1) && output1.length > 0) {
      imageUrl1 = output1[0]
    } else if (typeof output1 === 'string') {
      imageUrl1 = output1
    }
    
    const result: any = {
      success: true,
      test1: {
        model: 'stable-diffusion',
        outputType: typeof output1,
        outputConstructor: output1?.constructor?.name,
        hasUrl: output1 && typeof output1 === 'object' && 'url' in output1,
        extractedUrl: imageUrl1,
        rawOutput: JSON.stringify(output1, null, 2).substring(0, 500)
      }
    }
    
    // Test 2: flux-kontext-max (image to image) - only if we got an image
    if (imageUrl1) {
      try {
        console.log('[Test] Running stable-diffusion img2img test with base image...')
        const output2 = await replicate.run(
          "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          {
            input: {
              prompt: "Add two triangle ears on top of the circle",
              image: imageUrl1,
              negative_prompt: "complex, detailed, shading, colors",
              prompt_strength: 0.5,
              num_outputs: 1
            }
          }
        )
        
        console.log('[Test] flux-kontext-max output:', output2)
        
        let imageUrl2 = null
        if (output2 && typeof output2 === 'object' && 'url' in output2) {
          imageUrl2 = typeof output2.url === 'function' ? output2.url() : output2.url
        } else if (Array.isArray(output2) && output2.length > 0) {
          imageUrl2 = output2[0]
        } else if (typeof output2 === 'string') {
          imageUrl2 = output2
        }
        
        result.test2 = {
          model: 'stable-diffusion-img2img',
          baseImage: imageUrl1,
          outputType: typeof output2,
          outputConstructor: output2?.constructor?.name,
          extractedUrl: imageUrl2,
          rawOutput: JSON.stringify(output2, null, 2).substring(0, 500)
        }
      } catch (error2) {
        result.test2 = {
          error: error2 instanceof Error ? error2.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('[Test Replicate] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}