import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateImage(prompt: string): Promise<string> {
  const output = await replicate.run(
    "google/imagen-4",
    {
      input: {
        prompt: prompt,
        aspect_ratio: "1:1"
      }
    }
  )

  if (Array.isArray(output) && output.length > 0) {
    return output[0]
  } else if (typeof output === 'string') {
    return output
  } else {
    throw new Error('Unexpected output format from Replicate')
  }
}