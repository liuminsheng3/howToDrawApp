import { NextRequest, NextResponse } from 'next/server'
import { generateTutorialSteps } from '@/lib/openrouter'
import { generateImage } from '@/lib/replicate'
import { createServerSupabase } from '@/lib/supabase'
import { downloadAndStoreImage } from '@/lib/imageStorage'

// Use nodejs runtime for background tasks
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Increase timeout to 60 seconds

export async function POST(request: NextRequest) {
  console.log('[Generate API] Starting generation process')
  
  try {
    const { topic } = await request.json()
    console.log('[Generate API] Received topic:', topic)
    
    if (!topic) {
      console.error('[Generate API] No topic provided')
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Step 1: Generate tutorial structure with GPT-4o
    console.log('[Generate API] Calling generateTutorialSteps...')
    const startTime = Date.now()
    const tutorialData = await generateTutorialSteps(topic)
    console.log('[Generate API] Tutorial data generated in', Date.now() - startTime, 'ms')
    console.log('[Generate API] Steps count:', tutorialData.steps?.length)
    
    // Step 2: Create tutorial record in database
    console.log('[Generate API] Creating tutorial record in database...')
    const supabase = createServerSupabase()
    // First try with all columns, then fallback to basic columns
    let tutorial
    let tutorialError
    
    try {
      // Try with progress tracking columns
      const result = await supabase
        .from('tutorials')
        .insert({
          topic,
          title: tutorialData.title,
          intro: tutorialData.intro,
          outro: tutorialData.outro,
          status: 'generating',
          total_steps: tutorialData.steps.length,
          current_step: 'generate_prompt',
          completed_steps: 1
        })
        .select()
        .single()
      
      tutorial = result.data
      tutorialError = result.error
    } catch (e) {
      console.log('[Generate API] Trying without progress columns...')
    }
    
    // If failed, try without progress columns
    if (!tutorial || tutorialError) {
      console.log('[Generate API] Inserting without progress tracking...')
      const result = await supabase
        .from('tutorials')
        .insert({
          topic,
          title: tutorialData.title,
          intro: tutorialData.intro,
          outro: tutorialData.outro,
          status: 'generating'
        })
        .select()
        .single()
      
      tutorial = result.data
      tutorialError = result.error
    }

    if (tutorialError) {
      console.error('[Generate API] Database error:', tutorialError)
      throw tutorialError
    }
    
    console.log('[Generate API] Tutorial created with ID:', tutorial.id)

    // Save total steps to database if possible
    try {
      await supabase
        .from('tutorials')
        .update({ total_steps: tutorialData.steps.length })
        .eq('id', tutorial.id)
    } catch (e) {
      console.log('[Generate API] Could not update total_steps')
    }

    // Trigger separate API call for image generation
    const baseUrl = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const imageGenUrl = `${protocol}://${baseUrl}/api/generate-images`
    
    console.log('[Generate API] Triggering image generation at:', imageGenUrl)
    
    // Fire and forget - don't wait for response
    fetch(imageGenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutorialId: tutorial.id,
        steps: tutorialData.steps
      })
    }).then(res => {
      console.log('[Generate API] Image generation triggered, status:', res.status)
    }).catch(err => {
      console.error('[Generate API] Failed to trigger image generation:', err)
    })

    return NextResponse.json({ 
      id: tutorial.id, 
      status: 'generating',
      totalSteps: tutorialData.steps.length,
      message: 'Tutorial is being generated. Please check back in a few moments.'
    })
  } catch (error) {
    console.error('[Generate API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    return NextResponse.json(
      { 
        error: 'Failed to generate tutorial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}