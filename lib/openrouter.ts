const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function generateTutorialSteps(topic: string) {
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
- Generate 5-8 steps
- Each step should be simple and build on the previous
- Start with basic shapes, end with details
- Keep text concise and clear
- Image prompts must specify "simple black and white line drawing" and "white background"`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a drawing tutorial for: ${topic}` }
      ],
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`)
  }

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}