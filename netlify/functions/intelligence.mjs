import { json, getBinancePairs, getCoinGeckoMarket, demoPairs, intelligenceFromPairs, fetchJson } from './_utils.mjs';

export async function handler() {
  const attempts = [];
  try {
    const key = process.env.SOSOVALUE_API_KEY;
    const base = process.env.SOSOVALUE_BASE_URL || 'https://api.sosovalue.com';
    if (key) {
      attempts.push('SoSoValue');
      // Flexible probe: users can set SOSOVALUE_INTEL_PATH in Netlify when their plan exposes another path.
      const path = process.env.SOSOVALUE_INTEL_PATH || '/openapi/v1/news';
      const news = await fetchJson(`${base}${path}`, { headers: { 'x-api-key': key, authorization: `Bearer ${key}` } }, 6500);
      const pairs = await getBinancePairs().catch(() => demoPairs);
      const data = intelligenceFromPairs(pairs, 'SoSoValue + Market Fallback');
      if (Array.isArray(news?.data)) {
        data.tape = news.data.slice(0, 5).map((n, i) => ({ age: `${i + 2}m ago`, tag: n.category || n.tag || 'SOSO', title: n.title || 'SoSoValue update', body: n.summary || n.description || 'Live research item from SoSoValue.', icon: ['◈','⌂','⌁','₿','◆'][i] }));
      }
      return json(data);
    }
  } catch (e) { attempts.push(`SoSoValue failed: ${e.message}`); }

  try {
    attempts.push('Binance');
    return json({ ...intelligenceFromPairs(await getBinancePairs(), 'Binance Public API'), attempts });
  } catch (e) { attempts.push(`Binance failed: ${e.message}`); }

  try {
    attempts.push('CoinGecko');
    return json({ ...intelligenceFromPairs(await getCoinGeckoMarket(), 'CoinGecko Public API'), attempts });
  } catch (e) { attempts.push(`CoinGecko failed: ${e.message}`); }

  return json({ ...intelligenceFromPairs(demoPairs, 'Demo'), attempts });
}
