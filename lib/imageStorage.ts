import { createServerSupabase } from './supabase'

export async function downloadAndStoreImage(
  imageUrl: string, 
  tutorialId: string, 
  stepNumber: number
): Promise<string | null> {
  try {
    console.log('[ImageStorage] Downloading image from:', imageUrl)
    
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${tutorialId}/step-${stepNumber}-${timestamp}.png`
    
    console.log('[ImageStorage] Storing image as:', filename)
    
    // Upload to Supabase Storage
    const supabase = createServerSupabase()
    const { data, error } = await supabase.storage
      .from('tutorial-images')
      .upload(filename, buffer, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (error) {
      console.error('[ImageStorage] Upload error:', error)
      throw error
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tutorial-images')
      .getPublicUrl(filename)
    
    console.log('[ImageStorage] Stored image URL:', urlData.publicUrl)
    return urlData.publicUrl
    
  } catch (error) {
    console.error('[ImageStorage] Error storing image:', error)
    return null
  }
}