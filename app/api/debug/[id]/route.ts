import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tutorialId = params.id
  console.log('[Debug API] Checking tutorial:', tutorialId)
  
  const supabase = createServerSupabase()
  
  try {
    // Get tutorial data
    const { data: tutorial, error: tutorialError } = await supabase
      .from('tutorials')
      .select('*')
      .eq('id', tutorialId)
      .single()
    
    if (tutorialError) throw tutorialError
    
    // Get tutorial steps
    const { data: steps, error: stepsError } = await supabase
      .from('tutorial_steps')
      .select('*')
      .eq('tutorial_id', tutorialId)
      .order('step_number')
    
    if (stepsError) throw stepsError
    
    return NextResponse.json({
      tutorial: {
        id: tutorial.id,
        title: tutorial.title,
        status: tutorial.status,
        total_steps: tutorial.total_steps,
        current_step: tutorial.current_step,
        completed_steps: tutorial.completed_steps,
        created_at: tutorial.created_at
      },
      actualStepsCount: steps?.length || 0,
      steps: steps?.map(s => ({
        step_number: s.step_number,
        has_image: !!s.image_url,
        has_stored_image: !!s.stored_image_url
      })),
      analysis: {
        totalStepsMatches: tutorial.total_steps === (steps?.length || 0),
        expectedSteps: tutorial.total_steps,
        actualSteps: steps?.length || 0,
        missingSteps: tutorial.total_steps - (steps?.length || 0)
      }
    })
  } catch (error) {
    console.error('[Debug API] Error:', error)
    return NextResponse.json({ error: 'Failed to get debug info' }, { status: 500 })
  }
}