import { NextRequest, NextResponse } from 'next/server'
import { generateConsistentSteps } from '@/lib/consistentGeneration'
import { downloadAndStoreImage } from '@/lib/imageStorage'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log('[Generate Consistent API] Starting generation process')
  
  try {
    const { tutorialId, steps } = await request.json()
    console.log('[Generate Consistent API] Tutorial ID:', tutorialId)
    console.log('[Generate Consistent API] Steps to generate:', steps.length)
    
    const supabase = createServerSupabase()
    
    // Extract topic
    const topicMatch = steps[0]?.text?.match(/draw (?:a |an )?(.+?)(?:\.|$)/i)
    const topic = topicMatch ? topicMatch[1] : 'drawing'
    console.log('[Generate Consistent API] Topic:', topic)
    
    // Generate all images with consistent style
    console.log('[Generate Consistent API] Generating all images...')
    const allImageUrls = await generateConsistentSteps(topic, steps)
    
    let completedSteps = 0
    
    // Save each image
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const tempImageUrl = allImageUrls[i]
      
      if (!tempImageUrl) {
        console.error(`[Generate Consistent API] No image URL for step ${i + 1}`)
        continue
      }
      
      console.log(`[Generate Consistent API] Saving step ${i + 1}...`)
      
      // Update progress
      try {
        await supabase
          .from('tutorials')
          .update({ 
            current_step: `saving_image_${step.step_number}`,
            completed_steps: i + 2, // +1 for AI generation, +1 for current
            total_steps: steps.length
          })
          .eq('id', tutorialId)
      } catch (e) {
        console.log('[Generate Consistent API] Could not update progress')
      }
      
      // Download and store
      const storedImageUrl = await downloadAndStoreImage(
        tempImageUrl, 
        tutorialId, 
        step.step_number
      )
      
      // Insert into database
      await supabase
        .from('tutorial_steps')
        .insert({
          tutorial_id: tutorialId,
          step_number: step.step_number,
          text: step.text,
          image_prompt: `Consistent generation - Step ${step.step_number}`,
          image_url: tempImageUrl,
          stored_image_url: storedImageUrl || tempImageUrl
        })
      
      completedSteps++
    }
    
    // Update final status
    console.log('[Generate Consistent API] Updating final status...')
    
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
    
    console.log('[Generate Consistent API] Tutorial completed successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Images generated with consistent style'
    })
    
  } catch (error) {
    console.error('[Generate Consistent API] Error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}