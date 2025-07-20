import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  console.log('[Test API] Starting API test...')
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length,
      hasReplicateKey: !!process.env.REPLICATE_API_TOKEN,
      replicateKeyLength: process.env.REPLICATE_API_TOKEN?.length,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    tests: {
      supabase: { status: 'pending', message: '' },
      openrouter: { status: 'pending', message: '' },
      replicate: { status: 'pending', message: '' }
    }
  }
  
  // Test Supabase connection
  try {
    console.log('[Test API] Testing Supabase connection...')
    const supabase = createServerSupabase()
    const { count, error } = await supabase
      .from('tutorials')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    
    results.tests.supabase = {
      status: 'success',
      message: `Connected successfully. Tutorials count: ${count}`
    }
  } catch (error) {
    results.tests.supabase = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  // Test OpenRouter API
  try {
    console.log('[Test API] Testing OpenRouter API...')
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    results.tests.openrouter = {
      status: 'success',
      message: `Connected successfully. Available models: ${data.data?.length || 0}`
    }
  } catch (error) {
    results.tests.openrouter = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  // Test Replicate API
  try {
    console.log('[Test API] Testing Replicate API...')
    const response = await fetch('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    results.tests.replicate = {
      status: 'success',
      message: 'Connected successfully'
    }
  } catch (error) {
    results.tests.replicate = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  console.log('[Test API] Test results:', results)
  
  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}