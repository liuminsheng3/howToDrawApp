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
      "image_prompt": "Simple line drawing tutorial step 1: [describe what to draw], minimal black lines on white background",
      "cumulative_prompt": "Simple line drawing showing [complete description of what should be visible at this step]"
    }
  ],
  "outro": "A short conclusion (1-2 sentences)"
}

Rules:
- Generate 8-10 steps for all topics
- Each step MUST build upon the previous one
- Structure the tutorial like this:
  - Step 1-2: Basic shapes/framework (circles, ovals, guidelines)
  - Step 3-5: Main body parts/structure
  - Step 6-8: Important details (eyes, nose, mouth, etc.)
  - Step 9-10: Final details and cleanup
- For the image_prompt: describe ONLY what's NEW in this step
- For the cumulative_prompt: describe EVERYTHING drawn so far (accumulative)
- Keep descriptions simple and specific
- Example for cat:
  - Step 1: "Draw a large circle for the head"
    - image_prompt: "Simple line drawing tutorial step 1: one large circle, minimal black lines on white background"
    - cumulative_prompt: "Simple line drawing showing one large circle"
  - Step 2: "Add two small triangles on top for ears"
    - image_prompt: "Simple line drawing tutorial step 2: large circle with two triangular ears on top, minimal black lines on white background"
    - cumulative_prompt: "Simple line drawing showing a circle with two triangular ears"
  - Step 3: "Draw two dots for eyes"
    - image_prompt: "Simple line drawing tutorial step 3: cat head circle with triangular ears and two dot eyes, minimal black lines on white background"
    - cumulative_prompt: "Simple line drawing showing a circle with triangular ears and two dot eyes"
- IMPORTANT: Each cumulative_prompt includes ALL previous elements
- Use simple, clean, minimalist style suitable for beginners
- Avoid complex details or shading`

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