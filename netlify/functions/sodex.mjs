import { json, fetchJson, getBinancePairs, getCoinGeckoMarket, demoPairs } from './_utils.mjs';

export async function handler(event) {
  const symbol = event.queryStringParameters?.symbol || 'BTCUSDC';
  const attempts = [];
  try {
    const base = process.env.SODEX_BASE_URL || 'https://api.sodex.com';
    const path = process.env.SODEX_MARKETS_PATH || '/api/v1/markets';
    attempts.push('SoDEX');
    const data = await fetchJson(`${base}${path}`, {}, 6500);
    return json({ source: 'SoDEX API', live: true, symbol, data, attempts });
  } catch (e) { attempts.push(`SoDEX failed: ${e.message}`); }

  try {
    attempts.push('Binance');
    const pairs = await getBinancePairs();
    return json({ source: 'Binance Public API', live: true, symbol, pairs, attempts });
  } catch (e) { attempts.push(`Binance failed: ${e.message}`); }

  try {
    attempts.push('CoinGecko');
    const pairs = await getCoinGeckoMarket();
    return json({ source: 'CoinGecko Public API', live: true, symbol, pairs, attempts });
  } catch (e) { attempts.push(`CoinGecko failed: ${e.message}`); }

  return json({ source: 'Demo', live: false, symbol, pairs: demoPairs, attempts });
}
