import { json } from './_utils.mjs';

export async function handler() {
  return json({
    app: 'SODAR',
    ok: true,
    time: new Date().toISOString(),
    keys: {
      sosovalue: Boolean(process.env.SOSOVALUE_API_KEY),
      sodex: Boolean(process.env.SODEX_API_KEY_NAME || process.env.SODEX_PRIVATE_KEY)
    },
    fallback: ['Binance Public API', 'CoinGecko Public API', 'Demo Data']
  });
}
