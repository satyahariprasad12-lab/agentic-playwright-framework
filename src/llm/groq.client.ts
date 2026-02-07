import fetch from 'node-fetch';

const GROQ_MODEL = 'llama-3.1-8b-instant';

type GroqChatCompletionResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export async function askGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 150,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as GroqChatCompletionResponse;

  return data.choices[0].message.content.trim();
}
