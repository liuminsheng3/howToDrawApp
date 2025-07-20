import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tutorialId = params.id
    console.log('[Delete API] Deleting tutorial:', tutorialId)
    
    const supabase = createServerSupabase()
    
    // First, get all image URLs from tutorial_steps
    const { data: steps, error: fetchError } = await supabase
      .from('tutorial_steps')
      .select('stored_image_url')
      .eq('tutorial_id', tutorialId)
    
    if (fetchError) {
      console.error('[Delete API] Error fetching steps:', fetchError)
    }
    
    // Delete images from storage
    if (steps && steps.length > 0) {
      const imagePaths = steps
        .filter(step => step.stored_image_url)
        .map(step => {
          // Extract path from URL
          const url = new URL(step.stored_image_url)
          const pathParts = url.pathname.split('/tutorial-images/')
          return pathParts[1] || ''
        })
        .filter(path => path)
      
      if (imagePaths.length > 0) {
        console.log('[Delete API] Deleting images:', imagePaths)
        const { error: storageError } = await supabase.storage
          .from('tutorial-images')
          .remove(imagePaths)
        
        if (storageError) {
          console.error('[Delete API] Error deleting images:', storageError)
        }
      }
    }
    
    // Delete tutorial (cascade will delete tutorial_steps)
    const { error: deleteError } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', tutorialId)
    
    if (deleteError) {
      throw deleteError
    }
    
    console.log('[Delete API] Tutorial deleted successfully')
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Delete API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tutorial' },
      { status: 500 }
    )
  }
}