const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function generateTutorialSteps(topic: string) {
  console.log('[OpenRouter] Starting tutorial generation for topic:', topic)
  const systemPrompt = `You are an expert at creating simple, beginner-friendly drawing tutorials. 
Generate a step-by-step tutorial in JSON format with exactly this structure:
{
  "title": "How to Draw [Topic]",
  "intro": "A short introduction (1-2 sentences)",
  "steps": [
    {
      "step_number": 1,
      "text": "Step instruction text",
      "image_prompt": "Simple black and white line drawing showing [specific instruction], minimal style, on white background"
    }
  ],
  "outro": "A short conclusion (1-2 sentences)"
}

Rules:
- Generate between 3-15 steps based on complexity:
  - Simple objects (ball, star): 3-5 steps
  - Medium complexity (animals, simple buildings): 6-10 steps
  - Complex subjects (detailed scenes, characters): 10-15 steps
- NEVER exceed 15 steps
- Each step should be simple and build on the previous
- Start with basic shapes, end with details
- Keep text concise and clear
- Image prompts must specify "simple black and white line drawing" and "white background"`

  const requestBody = {
    model: 'openai/gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a drawing tutorial for: ${topic}` }
    ],
    response_format: { type: 'json_object' }
  }
  
  console.log('[OpenRouter] API Key exists:', !!OPENROUTER_API_KEY)
  console.log('[OpenRouter] API Key length:', OPENROUTER_API_KEY?.length)
  console.log('[OpenRouter] Sending request to OpenRouter API...')
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  console.log('[OpenRouter] Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('[OpenRouter] Error response:', errorText)
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('[OpenRouter] Response received:', {
    hasChoices: !!data.choices,
    choicesCount: data.choices?.length
  })
  
  const tutorialData = JSON.parse(data.choices[0].message.content)
  console.log('[OpenRouter] Tutorial parsed successfully:', {
    title: tutorialData.title,
    stepsCount: tutorialData.steps?.length
  })
  
  return tutorialData
}