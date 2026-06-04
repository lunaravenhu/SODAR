const timeout = (ms = 6500) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

export async function fetchJson(url, options = {}, ms = 6500) {
  const res = await Promise.race([fetch(url, options), timeout(ms)]);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function json(data, status = 200) {
  return {
    statusCode: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=15',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(data)
  };
}

export function normalizeBinanceTicker(rows = []) {
  const wanted = ['BTCUSDC','ETHUSDC','SOLUSDC','ARBUSDC','OPUSDC','DOGEUSDC','XRPUSDC','BNBUSDC'];
  return rows.filter(r => wanted.includes(r.symbol)).map((r) => ({
    pair: r.symbol.replace('USDC', '/USDC'),
    chain: chainName(r.symbol),
    price: Number(r.lastPrice || r.price || 0),
    change24h: Number(r.priceChangePercent || 0),
    liquidity: Math.round(Number(r.quoteVolume || 0)),
    score: Math.max(1, Math.min(99, Math.round(55 + Number(r.priceChangePercent || 0) * 2 + Math.log10(Number(r.quoteVolume || 1))))),
    source: 'Binance Public API'
  }));
}

function chainName(symbol){
  if(symbol.startsWith('BTC')) return 'Bitcoin';
  if(symbol.startsWith('ETH')) return 'Ethereum';
  if(symbol.startsWith('SOL')) return 'Solana';
  if(symbol.startsWith('ARB')) return 'Arbitrum';
  if(symbol.startsWith('OP')) return 'Optimism';
  if(symbol.startsWith('DOGE')) return 'Dogecoin';
  if(symbol.startsWith('XRP')) return 'XRP Ledger';
  if(symbol.startsWith('BNB')) return 'BNB Chain';
  return 'Market';
}

export async function getBinancePairs() {
  const base = process.env.BINANCE_BASE_URL || 'https://api.binance.com';
  const rows = await fetchJson(`${base}/api/v3/ticker/24hr`, {}, 6500);
  const pairs = normalizeBinanceTicker(rows);
  if (!pairs.length) throw new Error('Binance returned no supported USDC pairs');
  return pairs;
}

export async function getBinanceOrderbook(symbol='BTCUSDC') {
  const base = process.env.BINANCE_BASE_URL || 'https://api.binance.com';
  const data = await fetchJson(`${base}/api/v3/depth?symbol=${encodeURIComponent(symbol)}&limit=20`, {}, 6500);
  const normalize = (arr) => arr.map(([price, size]) => ({ price:Number(price), size:Number(size), total:Number(price)*Number(size) }));
  return { source: 'Binance Public API', bids: normalize(data.bids || []), asks: normalize(data.asks || []) };
}

export async function getCoinGeckoMarket() {
  const base = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  const ids = 'bitcoin,ethereum,solana,arbitrum,optimism,dogecoin,ripple,binancecoin';
  const rows = await fetchJson(`${base}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h`, {}, 7500);
  return rows.map((r) => ({
    pair: `${String(r.symbol).toUpperCase()}/USDC`, chain: r.name, price: r.current_price, change24h: r.price_change_percentage_24h || 0,
    liquidity: r.total_volume || 0, score: Math.max(1, Math.min(99, Math.round(55 + (r.price_change_percentage_24h || 0) * 2 + Math.log10(r.total_volume || 1)))), source: 'CoinGecko Public API'
  }));
}

export async function getCoinGeckoTape() {
  const base = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  const data = await fetchJson(`${base}/search/trending`, {}, 7500);
  return (data.coins || []).slice(0, 6).map(item => ({
    tag: 'TRENDING', title: item.item?.name || item.item?.symbol || 'Trending asset', body: `Rank ${item.item?.market_cap_rank || '—'} · ${item.item?.symbol || ''}`, source: 'CoinGecko Public API'
  }));
}

export async function getSoDEXPairs() {
  const base = process.env.SODEX_BASE_URL;
  if (!base) throw new Error('SODEX_BASE_URL not configured');
  const path = process.env.SODEX_MARKETS_PATH || '/api/v1/tickers';
  const rows = await fetchJson(`${base}${path}`, {}, 6500);
  const list = Array.isArray(rows) ? rows : (rows.data || rows.result || rows.tickers || []);
  if (!Array.isArray(list) || !list.length) throw new Error('SoDEX market endpoint returned no rows');
  return list.slice(0, 12).map((r) => ({
    pair: r.pair || r.symbol || r.market || `${r.base || 'ASSET'}/${r.quote || 'USDC'}`,
    chain: r.chain || 'SoDEX',
    price: Number(r.price || r.lastPrice || r.last || r.markPrice || 0),
    change24h: Number(r.change24h || r.priceChangePercent || r.change || 0),
    liquidity: Number(r.liquidity || r.volume24h || r.quoteVolume || 0),
    score: Math.max(1, Math.min(99, Math.round(55 + Number(r.change24h || r.priceChangePercent || 0) * 2 + Math.log10(Number(r.liquidity || r.volume24h || r.quoteVolume || 1))))),
    source: 'SoDEX API'
  })).filter(p => p.price > 0);
}

export async function getSoSoValueTape() {
  const key = process.env.SOSOVALUE_API_KEY;
  if (!key) throw new Error('SOSOVALUE_API_KEY not configured');
  const base = process.env.SOSOVALUE_BASE_URL || 'https://api.sosovalue.com';
  const path = process.env.SOSOVALUE_NEWS_PATH || '/openapi/v1/news';
  const data = await fetchJson(`${base}${path}`, { headers: { Authorization: `Bearer ${key}`, 'x-api-key': key } }, 7500);
  const list = Array.isArray(data) ? data : (data.data || data.result || data.items || []);
  if (!Array.isArray(list) || !list.length) throw new Error('SoSoValue endpoint returned no items');
  return list.slice(0, 8).map((n) => ({ tag: n.tag || n.category || 'SOSO', title: n.title || n.headline || 'SoSoValue update', body: n.summary || n.description || n.content || n.url || '', source: 'SoSoValue API' }));
}

export function intelligenceFromLive(pairs = [], tape = [], source = 'Live') {
  if (!pairs.length) throw new Error('No live pairs available');
  const sorted = [...pairs].sort((a,b) => (b.score || 0) - (a.score || 0));
  const avgScore = Math.round(sorted.reduce((n,p)=>n+(p.score||50),0) / sorted.length);
  const risk = avgScore > 78 ? 'Low' : avgScore > 65 ? 'Moderate' : 'High';
  const totalVol = sorted.reduce((n,p)=>n+(Number(p.liquidity)||0),0);
  return {
    live: true,
    source,
    updatedAt: new Date().toISOString(),
    metrics: {
      opportunities: sorted.filter(p => (p.score||0) >= 70).length,
      sentimentScore: avgScore,
      sentimentText: avgScore > 72 ? 'Bullish' : avgScore > 58 ? 'Neutral' : 'Defensive',
      riskState: risk,
      riskScore: risk === 'Low' ? 24 : risk === 'Moderate' ? 42 : 68,
      volume24h: totalVol ? `$${Math.round(totalVol).toLocaleString()}` : '—',
      btcPrice: sorted.find(p=>/^BTC/.test(p.pair))?.price || null
    },
    pairs: sorted,
    tape,
    routing: { source, live: true }
  };
}
