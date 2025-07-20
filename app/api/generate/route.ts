import { NextRequest, NextResponse } from 'next/server'
import { generateTutorialSteps } from '@/lib/openrouter'
import { generateImage } from '@/lib/replicate'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'edge'
export const maxDuration = 60 // Increase timeout to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Step 1: Generate tutorial structure with GPT-4o
    const tutorialData = await generateTutorialSteps(topic)
    
    // Step 2: Create tutorial record in database
    const supabase = createServerSupabase()
    const { data: tutorial, error: tutorialError } = await supabase
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

    if (tutorialError) throw tutorialError

    // Return immediately with tutorial ID
    // Image generation will continue in background
    generateImagesInBackground(tutorial.id, tutorialData.steps, supabase)

    return NextResponse.json({ 
      id: tutorial.id, 
      status: 'generating',
      message: 'Tutorial is being generated. Please check back in a few moments.'
    })
  } catch (error) {
    console.error('Error in generate API:', error)
    return NextResponse.json(
      { error: 'Failed to generate tutorial' },
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
  try {
    let completedCount = 1 // Start at 1 because prompt generation is complete
    
    // Generate images for each step sequentially to track progress
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Update current step
      await supabase
        .from('tutorials')
        .update({ 
          current_step: `generate_image_${step.step_number}`,
          completed_steps: completedCount
        })
        .eq('id', tutorialId)
      
      try {
        const imageUrl = await generateImage(step.image_prompt)
        
        await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorialId,
            step_number: step.step_number,
            text: step.text,
            image_prompt: step.image_prompt,
            image_url: imageUrl
          })
        
        completedCount++
        
        // Update completed steps count
        await supabase
          .from('tutorials')
          .update({ completed_steps: completedCount })
          .eq('id', tutorialId)
          
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
    await supabase
      .from('tutorials')
      .update({ 
        status: 'ready',
        current_step: 'finalize',
        completed_steps: completedCount + 1
      })
      .eq('id', tutorialId)
  } catch (error) {
    console.error('Error in background image generation:', error)
    // Update tutorial status to error
    await supabase
      .from('tutorials')
      .update({ status: 'error' })
      .eq('id', tutorialId)
  }
}