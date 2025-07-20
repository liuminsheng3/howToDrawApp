import { NextRequest, NextResponse } from 'next/server'
import { generateTutorialSteps } from '@/lib/openrouter'
import { generateImage } from '@/lib/replicate'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'edge'

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
        status: 'generating'
      })
      .select()
      .single()

    if (tutorialError) throw tutorialError

    // Step 3: Generate images for each step and insert to database
    const stepsWithImages = []
    for (const step of tutorialData.steps) {
      try {
        const imageUrl = await generateImage(step.image_prompt)
        
        const { data: stepData, error: stepError } = await supabase
          .from('tutorial_steps')
          .insert({
            tutorial_id: tutorial.id,
            step_number: step.step_number,
            text: step.text,
            image_prompt: step.image_prompt,
            image_url: imageUrl
          })
          .select()
          .single()

        if (stepError) throw stepError
        stepsWithImages.push(stepData)
      } catch (error) {
        console.error(`Error generating image for step ${step.step_number}:`, error)
        // Continue with other steps even if one fails
      }
    }

    // Step 4: Update tutorial status to ready
    await supabase
      .from('tutorials')
      .update({ status: 'ready' })
      .eq('id', tutorial.id)

    return NextResponse.json({ id: tutorial.id, status: 'ready' })
  } catch (error) {
    console.error('Error in generate API:', error)
    return NextResponse.json(
      { error: 'Failed to generate tutorial' },
      { status: 500 }
    )
  }
}