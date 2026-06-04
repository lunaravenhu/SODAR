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
      'cache-control': 'public, max-age=20',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(data)
  };
}

export const demoPairs = [
  { pair: 'ETH/USDC', chain: 'Ethereum', price: 3812.45, change24h: 2.45, liquidity: 12450000, score: 87, icon: '◆' },
  { pair: 'BTC/USDC', chain: 'Bitcoin', price: 67842.10, change24h: 1.32, liquidity: 18320000, score: 82, icon: '₿' },
  { pair: 'SOL/USDC', chain: 'Solana', price: 164.32, change24h: 3.78, liquidity: 5210000, score: 78, icon: 'Ξ' },
  { pair: 'ARB/USDC', chain: 'Arbitrum', price: 1.2345, change24h: 6.21, liquidity: 2310000, score: 75, icon: '△' },
  { pair: 'TON/USDC', chain: 'Toncoin', price: 6.5321, change24h: 4.11, liquidity: 1890000, score: 72, icon: '▽' },
  { pair: 'MATIC/USDC', chain: 'Polygon', price: 0.812, change24h: 2.95, liquidity: 1510000, score: 69, icon: '◇' },
  { pair: 'OP/USDC', chain: 'Optimism', price: 2.3456, change24h: 2.71, liquidity: 1320000, score: 67, icon: '●' }
];

export const demoTape = [
  { age: '2m ago', tag: 'ETF FLOW', title: 'BlackRock IBIT sees $217M inflow', body: 'U.S. spot BTC ETFs total net inflow remains constructive.', icon: '◈' },
  { age: '15m ago', tag: 'MACRO', title: 'Fed Powell: rate cut possible this year', body: 'Inflation cooling continues, labor market balanced.', icon: '⌂' },
  { age: '32m ago', tag: 'ON-CHAIN', title: 'Whales accumulate 12,540 BTC', body: 'Large wallet accumulation detected in the last session.', icon: '⌁' },
  { age: '1h ago', tag: 'TREASURY', title: 'MicroStrategy adds 1,045 BTC', body: 'Total holdings reach more than 214,400 BTC.', icon: '₿' },
  { age: '2h ago', tag: 'NEWS', title: 'Ethereum ETF options trading launches', body: 'New derivatives access opens for institutional flow.', icon: '◆' }
];

export function normalizeBinanceTicker(rows = []) {
  const wanted = ['ETHUSDC','BTCUSDC','SOLUSDC','ARBUSDC','TONUSDC','MATICUSDC','OPUSDC'];
  return rows.filter(r => wanted.includes(r.symbol)).map((r, i) => ({
    pair: r.symbol.replace('USDC', '/USDC'),
    chain: ['Ethereum','Bitcoin','Solana','Arbitrum','Toncoin','Polygon','Optimism'][i] || 'Market',
    price: Number(r.lastPrice || r.price || 0),
    change24h: Number(r.priceChangePercent || 0),
    liquidity: Math.round(Number(r.quoteVolume || 0)),
    score: Math.max(50, Math.min(95, Math.round(66 + Number(r.priceChangePercent || 0) * 2 + Math.log10(Number(r.quoteVolume || 1))))),
    icon: ['◆','₿','Ξ','△','▽','◇','●'][i] || '◇'
  }));
}

export async function getBinancePairs() {
  const base = process.env.BINANCE_BASE_URL || 'https://api.binance.com';
  const rows = await fetchJson(`${base}/api/v3/ticker/24hr`, {}, 6500);
  const pairs = normalizeBinanceTicker(rows);
  if (!pairs.length) throw new Error('no binance pairs');
  return pairs;
}

export async function getCoinGeckoMarket() {
  const base = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  const ids = 'bitcoin,ethereum,solana,arbitrum,the-open-network,polygon-ecosystem-token,optimism';
  const rows = await fetchJson(`${base}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=7&page=1&sparkline=false&price_change_percentage=24h`, {}, 7000);
  return rows.map((r, i) => ({
    pair: `${String(r.symbol).toUpperCase()}/USDC`, chain: r.name, price: r.current_price, change24h: r.price_change_percentage_24h || 0,
    liquidity: r.total_volume || 0, score: Math.max(50, Math.min(95, Math.round(65 + (r.price_change_percentage_24h || 0) * 2 + Math.log10(r.total_volume || 1)))), icon: ['₿','◆','Ξ','△','▽','◇','●'][i] || '◇'
  }));
}

export function intelligenceFromPairs(pairs = demoPairs, source = 'Demo') {
  const sorted = [...pairs].sort((a,b) => b.score - a.score);
  const gainers = [...pairs].sort((a,b) => b.change24h - a.change24h).slice(0,5);
  const breadth = pairs.reduce((n,p)=> n + (p.change24h > 0 ? 1 : -1), 0);
  const avgScore = Math.round(sorted.reduce((n,p)=>n+p.score,0) / Math.max(1, sorted.length));
  const risk = avgScore > 78 ? 'Low' : avgScore > 65 ? 'Moderate' : 'High';
  return {
    source,
    live: source !== 'Demo',
    updatedAt: new Date().toISOString(),
    metrics: {
      btcDominance: 54.23,
      btcDominanceChange: 0.68,
      opportunities: sorted.filter(p => p.score >= 70).length,
      sentimentScore: avgScore - 8,
      sentimentText: avgScore > 70 ? 'Bullish' : 'Neutral',
      riskState: risk,
      riskScore: risk === 'Low' ? 24 : risk === 'Moderate' ? 38 : 61,
      marketCap: '$2.56T',
      volume24h: '$89.32B',
      btcPrice: sorted.find(p=>p.pair.startsWith('BTC'))?.price || 67842.10
    },
    pairs: sorted.slice(0,7),
    gainers,
    tape: demoTape,
    routing: {
      primary: source.includes('SoSo') ? 'SoSoValue API' : 'SoSoValue API',
      sodex: source.includes('SoDEX') ? 'Live' : 'Standby',
      fallback1: source.includes('Binance') ? 'Live' : 'Standby',
      fallback2: source.includes('CoinGecko') ? 'Live' : 'Standby',
      demo: source === 'Demo' ? 'ON' : 'OFF'
    }
  };
}
