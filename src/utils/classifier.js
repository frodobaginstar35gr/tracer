import { KNOWN_TRACKER_DOMAINS } from './tracker-lists.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function classifyRequest(details) {
  const url = new URL(details.url);
  const domain = url.hostname;

  const knownCategory = KNOWN_TRACKER_DOMAINS[domain];
  if (knownCategory) {
    return buildResult(details, true, knownCategory, 'known-list');
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    return buildResult(details, false, null, 'no-api-key');
  }

  const category = await askClaude(details, apiKey);
  const isTracker = category !== null;
  return buildResult(details, isTracker, category, 'claude');
}

async function askClaude(details, apiKey) {
  const prompt = `You are a web privacy analyst. Analyze this outbound HTTP request and determine if it is a tracking/analytics request.

URL: ${details.url}
Request type: ${details.type}
Initiator: ${details.initiator ?? 'unknown'}

Respond with JSON only:
{
  "isTracker": boolean,
  "category": "analytics" | "advertising" | "fingerprinting" | "social" | "crm" | "cdn" | null,
  "company": "<company name or null>",
  "confidence": 0.0-1.0,
  "reason": "<one sentence>"
}`;

  try {
    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    return parsed.isTracker ? parsed.category : null;
  } catch {
    return null;
  }
}

function buildResult(details, isTracker, category, source) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url: details.url,
    domain: new URL(details.url).hostname,
    initiator: details.initiator ?? null,
    type: details.type,
    isTracker,
    category,
    source,
    timestamp: Date.now(),
  };
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get('claudeApiKey', (result) => resolve(result.claudeApiKey ?? null));
  });
}
