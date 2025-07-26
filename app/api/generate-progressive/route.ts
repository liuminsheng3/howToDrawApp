import { NextRequest, NextResponse } from 'next/server'
import { generateProgressiveSteps } from '@/lib/progressiveGeneration'
import { downloadAndStoreImage } from '@/lib/imageStorage'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log('[Generate Progressive API] Starting generation process')
  
  try {
    const { tutorialId, steps } = await request.json()
    console.log('[Generate Progressive API] Tutorial ID:', tutorialId)
    console.log('[Generate Progressive API] Steps to generate:', steps.length)
    
    const supabase = createServerSupabase()
    
    // Extract topic from first step
    const topicMatch = steps[0]?.text?.match(/draw (?:a |an )?(.+?)(?:\.|$)/i)
    const topic = topicMatch ? topicMatch[1] : 'drawing'
    console.log('[Generate Progressive API] Topic:', topic)
    
    // Generate all images with progressive building
    console.log('[Generate Progressive API] Generating progressive images...')
    const allImageUrls = await generateProgressiveSteps(topic, steps)
    
    let completedSteps = 0
    
    // Save each image
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const tempImageUrl = allImageUrls[i]
      
      if (!tempImageUrl) {
        console.error(`[Generate Progressive API] No image URL for step ${i + 1}`)
        continue
      }
      
      console.log(`[Generate Progressive API] Saving step ${i + 1}...`)
      
      // Update progress
      try {
        await supabase
          .from('tutorials')
          .update({ 
            current_step: `saving_image_${step.step_number}`,
            completed_steps: i + 2,
            total_steps: steps.length
          })
          .eq('id', tutorialId)
      } catch (e) {
        console.log('[Generate Progressive API] Could not update progress')
      }
      
      // Download and store
      let storedImageUrl = tempImageUrl
      if (!tempImageUrl.includes('placeholder')) {
        storedImageUrl = await downloadAndStoreImage(
          tempImageUrl, 
          tutorialId, 
          step.step_number
        ) || tempImageUrl
      }
      
      // Insert into database
      await supabase
        .from('tutorial_steps')
        .insert({
          tutorial_id: tutorialId,
          step_number: step.step_number,
          text: step.text,
          image_prompt: `Progressive generation - Step ${step.step_number}`,
          image_url: tempImageUrl,
          stored_image_url: storedImageUrl
        })
      
      completedSteps++
    }
    
    // Update final status
    console.log('[Generate Progressive API] Updating final status...')
    
    const updateData: any = { status: 'ready' }
    
    // Try to update with progress columns
    try {
      await supabase
        .from('tutorials')
        .update({
          ...updateData,
          current_step: 'finalize',
          completed_steps: completedSteps + 2,
          total_steps: steps.length
        })
        .eq('id', tutorialId)
    } catch (e) {
      // Fallback without progress columns
      await supabase
        .from('tutorials')
        .update(updateData)
        .eq('id', tutorialId)
    }
    
    console.log('[Generate Progressive API] Tutorial completed successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Images generated with progressive building'
    })
    
  } catch (error) {
    console.error('[Generate Progressive API] Error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}