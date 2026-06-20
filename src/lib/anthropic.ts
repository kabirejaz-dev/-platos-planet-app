// Client-side call to the Anthropic API for the AI Tutor "Ask Question" feature.
//
// This ships VITE_ANTHROPIC_API_KEY inside the browser bundle, which is only
// acceptable for local/private demo use — never deploy this publicly with a
// real key. There is no backend in this project to proxy the request through.

export class NoApiKeyError extends Error {}

const SYSTEM_PROMPT =
  "You are a friendly, encouraging tutor for IGCSE/A-Level/CBSE students in the UAE/GCC. " +
  'Keep answers concise, use a worked example where useful, and format with markdown (**bold**, numbered steps).'

export async function askClaude(question: string, subject: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!apiKey) throw new NoApiKeyError('No Anthropic API key configured')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Subject: ${subject}\n\nQuestion: ${question}` }],
    }),
  })

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)

  const data = await res.json()
  const text = data?.content?.[0]?.text
  if (!text) throw new Error('Anthropic API returned no content')
  return text
}

export function hasAnthropicKey(): boolean {
  return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)
}
