import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/replicate'
import { generateImageV2 } from '@/lib/replicateV2'
import { downloadAndStoreImage } from '@/lib/imageStorage'
import { createServerSupabase } from '@/lib/supabase'
import { buildCumulativePrompt, optimizePromptForTopic } from '@/lib/promptBuilder'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { tutorialId, steps } = await request.json()
    console.log('[Generate Images API] Starting for tutorial:', tutorialId)
    console.log('[Generate Images API] Steps to generate:', steps.length)
    
    const supabase = createServerSupabase()
    let completedImageSteps = 0 // Count of completed image generation steps
    let previousImageUrl: string | null = null // Track previous image for img2img
    
    // Extract topic from first step or tutorial data
    const topicMatch = steps[0]?.text?.match(/draw (?:a |an )?(.+?)(?:\.|$)/i)
    const topic = topicMatch ? topicMatch[1] : 'drawing'
    
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
            completed_steps: completedImageSteps + 1, // +1 for initial AI generation
            total_steps: steps.length
          })
          .eq('id', tutorialId)
      } catch (e) {
        console.log('[Generate Images API] Could not update progress')
      }
      
      try {
        console.log(`[Generate Images API] Generating image for step ${step.step_number}...`)
        console.log(`[Generate Images API] Step ${step.step_number} text:`, step.text)
        
        // Build cumulative prompt using smart builder
        const isImg2Img = i > 0 && previousImageUrl !== null
        let cumulativePrompt = buildCumulativePrompt(steps, i, isImg2Img)
        
        // Optimize for specific topic
        cumulativePrompt = optimizePromptForTopic(cumulativePrompt, topic)
        
        console.log(`[Generate Images API] Step ${step.step_number} cumulative prompt:`, cumulativePrompt)
        
        // Pass previous image URL for img2img (except for first step)
        // Use V2 for now to debug
        const useV2 = true
        const tempImageUrl = useV2 
          ? await generateImageV2(cumulativePrompt, previousImageUrl || undefined)
          : await generateImage(cumulativePrompt, previousImageUrl || undefined)
        console.log(`[Generate Images API] Image generated:`, tempImageUrl)
        
        // Download and store the image
        const storedImageUrl = await downloadAndStoreImage(
          tempImageUrl, 
          tutorialId, 
          step.step_number
        )
        
        // Insert step into database with cumulative prompt
        await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorialId,
            step_number: step.step_number,
            text: step.text,
            image_prompt: cumulativePrompt, // Save the actual prompt used
            image_url: tempImageUrl,
            stored_image_url: storedImageUrl || tempImageUrl
          })
        
        // Update previous image URL for next iteration
        previousImageUrl = storedImageUrl || tempImageUrl
        
        completedImageSteps++
        console.log(`[Generate Images API] Step ${step.step_number} completed, total completed: ${completedImageSteps}`)
        
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
        completedImageSteps++
      }
    }
    
    // Update tutorial status to ready
    console.log('[Generate Images API] All steps completed, updating status...')
    console.log('[Generate Images API] Setting completed_steps to:', completedImageSteps + 2)
    console.log('[Generate Images API] Total steps:', steps.length)
    
    // Try to update with progress columns first
    let updateError
    let updateData: any = {
      status: 'ready'
    }
    
    // Try with progress tracking columns
    const fullUpdateData = {
      ...updateData,
      current_step: 'finalize',
      completed_steps: completedImageSteps + 2,
      total_steps: steps.length
    }
    
    const { error: fullError } = await supabase
      .from('tutorials')
      .update(fullUpdateData)
      .eq('id', tutorialId)
    
    if (fullError && fullError.message?.includes('column')) {
      // Fallback: try without progress columns
      console.log('[Generate Images API] Retrying without progress columns...')
      const { error: basicError } = await supabase
        .from('tutorials')
        .update(updateData)
        .eq('id', tutorialId)
      updateError = basicError
    } else {
      updateError = fullError
    }
    
    if (updateError) {
      console.error('[Generate Images API] Failed to update tutorial status:', updateError)
      throw updateError
    }
    
    console.log('[Generate Images API] Status updated successfully')
    
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