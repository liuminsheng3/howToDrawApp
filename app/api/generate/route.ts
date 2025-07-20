import { NextRequest, NextResponse } from 'next/server'
import { generateTutorialSteps } from '@/lib/openrouter'
import { generateImage } from '@/lib/replicate'
import { createServerSupabase } from '@/lib/supabase'
import { downloadAndStoreImage } from '@/lib/imageStorage'

export const runtime = 'edge'
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

    // Return immediately with tutorial ID
    // Image generation will continue in background
    generateImagesInBackground(tutorial.id, tutorialData.steps, supabase)

    return NextResponse.json({ 
      id: tutorial.id, 
      status: 'generating',
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

// Background function to generate images
async function generateImagesInBackground(
  tutorialId: string, 
  steps: any[], 
  supabase: any
) {
  console.log('[Background] Starting image generation for tutorial:', tutorialId)
  console.log('[Background] Total steps to generate:', steps.length)
  
  try {
    let completedCount = 1 // Start at 1 because prompt generation is complete
    
    // Generate images for each step sequentially to track progress
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Update current step (skip if columns don't exist)
      try {
        await supabase
          .from('tutorials')
          .update({ 
            current_step: `generate_image_${step.step_number}`,
            completed_steps: completedCount
          })
          .eq('id', tutorialId)
      } catch (e) {
        console.log('[Background] Progress tracking not available')
      }
      
      try {
        const tempImageUrl = await generateImage(step.image_prompt)
        
        // Download and store the image
        const storedImageUrl = await downloadAndStoreImage(
          tempImageUrl, 
          tutorialId, 
          step.step_number
        )
        
        await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorialId,
            step_number: step.step_number,
            text: step.text,
            image_prompt: step.image_prompt,
            image_url: tempImageUrl,
            stored_image_url: storedImageUrl || tempImageUrl
          })
        
        completedCount++
        
        // Update completed steps count (skip if column doesn't exist)
        try {
          await supabase
            .from('tutorials')
            .update({ completed_steps: completedCount })
            .eq('id', tutorialId)
        } catch (e) {
          // Progress tracking not available
        }
          
      } catch (error) {
        console.error(`Error generating image for step ${step.step_number}:`, error)
        // Insert step without image if generation fails
        await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorialId,
            step_number: step.step_number,
            text: step.text,
            image_prompt: step.image_prompt,
            image_url: null
          })
        completedCount++
      }
    }

    // Update tutorial status to ready and final step
    try {
      await supabase
        .from('tutorials')
        .update({ 
          status: 'ready',
          current_step: 'finalize',
          completed_steps: completedCount + 1
        })
        .eq('id', tutorialId)
    } catch (e) {
      // If progress columns don't exist, just update status
      await supabase
        .from('tutorials')
        .update({ status: 'ready' })
        .eq('id', tutorialId)
    }
  } catch (error) {
    console.error('Error in background image generation:', error)
    // Update tutorial status to error
    await supabase
      .from('tutorials')
      .update({ status: 'error' })
      .eq('id', tutorialId)
  }
}