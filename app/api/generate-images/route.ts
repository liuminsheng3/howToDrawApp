import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/replicate'
import { downloadAndStoreImage } from '@/lib/imageStorage'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { tutorialId, steps } = await request.json()
    console.log('[Generate Images API] Starting for tutorial:', tutorialId)
    console.log('[Generate Images API] Steps to generate:', steps.length)
    
    const supabase = createServerSupabase()
    let completedCount = 1 // Start at 1 because prompt generation is complete
    
    // Generate images for each step sequentially
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`[Generate Images API] Processing step ${step.step_number}...`)
      
      // Update current step
      try {
        await supabase
          .from('tutorials')
          .update({ 
            current_step: `generate_image_${step.step_number}`,
            completed_steps: completedCount,
            total_steps: steps.length
          })
          .eq('id', tutorialId)
      } catch (e) {
        console.log('[Generate Images API] Could not update progress')
      }
      
      try {
        console.log(`[Generate Images API] Generating image for step ${step.step_number}...`)
        const tempImageUrl = await generateImage(step.image_prompt)
        console.log(`[Generate Images API] Image generated:`, tempImageUrl)
        
        // Download and store the image
        const storedImageUrl = await downloadAndStoreImage(
          tempImageUrl, 
          tutorialId, 
          step.step_number
        )
        
        // Insert step into database
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
        console.log(`[Generate Images API] Step ${step.step_number} completed`)
        
      } catch (error) {
        console.error(`[Generate Images API] Error on step ${step.step_number}:`, error)
        // Insert step without image if generation fails
        await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorialId,
            step_number: step.step_number,
            text: step.text,
            image_prompt: step.image_prompt,
            image_url: null,
            stored_image_url: null
          })
        completedCount++
      }
    }
    
    // Update tutorial status to ready
    console.log('[Generate Images API] All steps completed, updating status...')
    await supabase
      .from('tutorials')
      .update({ 
        status: 'ready',
        current_step: 'finalize',
        completed_steps: completedCount + 1,
        total_steps: steps.length
      })
      .eq('id', tutorialId)
    
    return NextResponse.json({ 
      success: true,
      message: 'Images generated successfully'
    })
    
  } catch (error) {
    console.error('[Generate Images API] Fatal error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate images' 
    }, { status: 500 })
  }
}