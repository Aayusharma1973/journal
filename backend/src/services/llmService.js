const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";
async function analyzeEmotion(text) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set in .env");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an emotion analysis assistant. Analyze the journal entry and respond ONLY with a valid JSON object. No explanation, no markdown, no extra text.

JSON format:
{
  "emotion": "<single primary emotion word>",
  "keywords": ["<word1>", "<word2>", "<word3>"],
  "summary": "<one sentence summary of the user mental state>"
}`,
        },
        {
          role: "user",
          content: `Analyze this journal entry: "${text}"`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;

  if (!rawText) throw new Error("No text returned from model");

  return parseOutput(rawText);
}

function parseOutput(raw) {
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) throw new Error(`Could not find JSON in: ${cleaned}`);

  const parsed = JSON.parse(match[0]);

  if (!parsed.emotion || !Array.isArray(parsed.keywords) || !parsed.summary) {
    throw new Error("Model returned incomplete JSON");
  }

  return {
    emotion: String(parsed.emotion).toLowerCase().trim(),
    keywords: parsed.keywords.slice(0, 5).map((k) => String(k).toLowerCase()),
    summary: String(parsed.summary).trim(),
  };
}

module.exports = { analyzeEmotion };