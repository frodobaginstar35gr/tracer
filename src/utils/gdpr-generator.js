const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateDeletionRequest({ trackers, userEmail, userName }) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('Claude API key not set.');

  const companies = [...new Set(trackers.map((t) => t.domain))].join(', ');

  const prompt = `You are a privacy rights attorney. Draft a formal GDPR Article 17 / CCPA deletion request letter.

Sender: ${userName ?? 'Data Subject'} <${userEmail ?? 'user@example.com'}>
Companies / data processors detected: ${companies}

Write a professional, firm letter that:
1. Invokes the right to erasure (GDPR Art. 17) and CCPA opt-out / deletion rights
2. Requests confirmation of deletion within 30 days
3. Lists each company individually
4. Includes a numbered list of specific data types to be deleted (browsing data, device fingerprints, ad profiles, etc.)

Return only the letter text, ready to send.`;

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  return { letter: data.content?.[0]?.text ?? '' };
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get('claudeApiKey', (r) => resolve(r.claudeApiKey ?? null));
  });
}
