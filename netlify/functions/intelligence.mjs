import { json, getSoDEXPairs, getBinancePairs, getCoinGeckoMarket, getSoSoValueTape, getCoinGeckoTape, getBinanceOrderbook, intelligenceFromLive } from './_utils.mjs';

export async function handler() {
  const status = { sodex: 'Standby', soso: 'Standby', binance: 'Standby', coingecko: 'Standby' };
  let pairs = [], pairSource = '';
  let tape = [], tapeSource = '';
  try { pairs = await getSoDEXPairs(); pairSource = 'SoDEX API'; status.sodex = 'Live'; }
  catch(e){ status.sodex = `Error: ${e.message}`; }
  if (!pairs.length) {
    try { pairs = await getBinancePairs(); pairSource = 'Binance Public API'; status.binance = 'Live'; }
    catch(e){ status.binance = `Error: ${e.message}`; }
  }
  if (!pairs.length) {
    try { pairs = await getCoinGeckoMarket(); pairSource = 'CoinGecko Public API'; status.coingecko = 'Live'; }
    catch(e){ status.coingecko = `Error: ${e.message}`; }
  }
  try { tape = await getSoSoValueTape(); tapeSource = 'SoSoValue API'; status.soso = 'Live'; }
  catch(e){ status.soso = `Error: ${e.message}`; }
  if (!tape.length) {
    try { tape = await getCoinGeckoTape(); tapeSource = 'CoinGecko Public API'; status.coingecko = status.coingecko === 'Standby' ? 'Live' : status.coingecko; }
    catch(e){ status.coingecko = status.coingecko === 'Standby' ? `Error: ${e.message}` : status.coingecko; }
  }
  if (!pairs.length) return json({ live:false, error:'All live market sources failed. Demo data is disabled.', routing:{...status, source:'No live source', live:false} }, 503);
  const data = intelligenceFromLive(pairs, tape, pairSource + (tapeSource ? ` + ${tapeSource}` : ''));
  try { data.orderbook = await getBinanceOrderbook('BTCUSDC'); }
  catch(e){ data.orderbook = { source:'Unavailable', bids:[], asks:[], error:e.message }; }
  data.routing = { ...data.routing, ...status, demo:'Disabled' };
  return json(data);
}
