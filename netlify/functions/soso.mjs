import { json, fetchJson, demoTape } from './_utils.mjs';

export async function handler() {
  const attempts = [];
  try {
    const key = process.env.SOSOVALUE_API_KEY;
    if (!key) throw new Error('SOSOVALUE_API_KEY missing');
    const base = process.env.SOSOVALUE_BASE_URL || 'https://api.sosovalue.com';
    const path = process.env.SOSOVALUE_NEWS_PATH || '/openapi/v1/news';
    attempts.push('SoSoValue');
    const data = await fetchJson(`${base}${path}`, { headers: { 'x-api-key': key, authorization: `Bearer ${key}` } }, 6500);
    return json({ source: 'SoSoValue API', live: true, data, attempts });
  } catch (e) { attempts.push(`SoSoValue failed: ${e.message}`); }

  return json({ source: 'Demo Research Tape', live: false, data: demoTape, attempts });
}
