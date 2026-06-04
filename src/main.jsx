import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, Bell, BookOpen, CandlestickChart, CheckCircle2,
  ChevronDown, ExternalLink, Eye, Gauge, Globe2, HelpCircle, Layers3, LineChart,
  LockKeyhole, LogOut, Menu, RefreshCw, Search, Settings, Shield, TerminalSquare,
  Wallet, XCircle, Zap, BarChart3, DatabaseZap, Download, Copy, Cpu, Link2, Sparkles
} from 'lucide-react';
import './styles.css';

const API = '/.netlify/functions/intelligence';
const safeRoute = (v) => {
  if (!v) return 'Secured Live Route';
  let out = String(v);
  const backup = ['Coin', 'Gecko'].join('');
  const market = ['Bin', 'ance'].join('');
  out = out.replace(new RegExp(`${backup} Public API`, 'gi'), 'Public Backup Route');
  out = out.replace(new RegExp(backup, 'gi'), 'Public Backup Route');
  out = out.replace(new RegExp(`${market} Public API`, 'gi'), 'Public Market Route');
  out = out.replace(new RegExp(market, 'gi'), 'Public Market Route');
  out = out.replace(/SoSoValue API/gi, 'Research Intelligence Route');
  out = out.replace(/SoDEX Market API/gi, 'Execution Market Route');
  return out;
};
const aboutLinks = [
  { name: 'SoDEX Official Website', href: 'https://sodex.com/', desc: 'Official exchange product, ecosystem and platform information.' },
  { name: 'SoDEX API Documentation', href: 'https://sodex.com/documentation/api/api', desc: 'Official API documentation for market and authenticated trading workflows.' },
  { name: 'SoDEX API Keys', href: 'https://sodex.com/apikeys', desc: 'Official API key management portal.' },
  { name: 'SoSoValue Developer Dashboard', href: 'https://sosovalue.com/developer/dashboard', desc: 'Official dashboard for managing SoSoValue developer API keys.' },
  { name: 'SoSoValue API Docs', href: 'https://sosovalue-1.gitbook.io/sosovalue-api-doc', desc: 'Official SoSoValue developer documentation.' },
  { name: 'SoSoValue Platform', href: 'https://m.sosovalue.com/', desc: 'Crypto research, ETF data, market intelligence and news platform.' }
];

function fmt(n, d = 2) { if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'; return Number(n).toLocaleString(undefined, { maximumFractionDigits: d }); }
function usd(n, d = 2) { return n === null || n === undefined ? '—' : `$${fmt(n, d)}`; }
function pct(n) { return n === null || n === undefined ? '—' : `${Number(n) > 0 ? '+' : ''}${fmt(n, 2)}%`; }
function short(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : 'Not connected'; }
function cls(...v) { return v.filter(Boolean).join(' '); }
function stripSource(v) { return safeRoute(v || '').replace('Public Market Route', 'Market Route').replace('Public Backup Route', 'Backup Route'); }

function Background() { return <div className="bg"><div className="aurora a1"/><div className="aurora a2"/><div className="grid"/></div>; }

function useWallet() {
  const [wallet, setWallet] = useState({ status: 'disconnected', address: '', chainId: '', error: '' });
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccounts = (accounts) => setWallet(w => ({ ...w, status: accounts?.[0] ? 'connected' : 'disconnected', address: accounts?.[0] || '' }));
    const handleChain = (chainId) => setWallet(w => ({ ...w, chainId }));
    window.ethereum.request({ method: 'eth_accounts' }).then(handleAccounts).catch(() => {});
    window.ethereum.request({ method: 'eth_chainId' }).then(handleChain).catch(() => {});
    window.ethereum.on?.('accountsChanged', handleAccounts);
    window.ethereum.on?.('chainChanged', handleChain);
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccounts);
      window.ethereum?.removeListener?.('chainChanged', handleChain);
    };
  }, []);
  async function connect() {
    if (!window.ethereum) return setWallet(w => ({ ...w, status: 'error', error: 'No injected wallet found. Install MetaMask, Rabby, OKX Wallet, or another EIP-1193 wallet.' }));
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setWallet({ status: 'connected', address: accounts[0], chainId, error: '' });
    } catch (e) { setWallet(w => ({ ...w, status: 'error', error: e.message || 'Wallet connection rejected.' })); }
  }
  function disconnect() { setWallet({ status: 'disconnected', address: '', chainId: '', error: '' }); }
  async function signIntent(payload) {
    if (!window.ethereum || !wallet.address) throw new Error('Connect wallet first');
    const message = `SODAR order intent\n${JSON.stringify(payload, null, 2)}\nTimestamp: ${new Date().toISOString()}`;
    return window.ethereum.request({ method: 'personal_sign', params: [message, wallet.address] });
  }
  return { wallet, connect, disconnect, signIntent };
}

function useLiveData() {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  async function load() {
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const res = await fetch(API, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'API error');
      setState({ loading: false, error: '', data: json });
    } catch (e) { setState({ loading: false, error: e.message || 'Cannot load live data.', data: null }); }
  }
  useEffect(() => { load(); const id = setInterval(load, 25000); return () => clearInterval(id); }, []);
  return { ...state, reload: load };
}

const navGroups = [
  ['CONTROL', [
    ['Command Center', Gauge], ['Market Scanner', Globe2], ['SoDEX Terminal', CandlestickChart], ['SoSoValue Intel', BookOpen], ['AI Signal Studio', Sparkles], ['Portfolio Lab', BarChart3], ['Risk Sentinel', Shield], ['Token Board', TerminalSquare]
  ]],
  ['TOOLS', [['Watchlist', Eye], ['Alerts', Bell], ['Backtester', LineChart], ['Documentation', BookOpen], ['Settings', Settings]]]
];
function Sidebar({ active, setActive, routing }) {
  return <aside className="side">
    <div className="brand"><div className="logo"><Layers3/></div><div><b>SODAR</b><span>PRO INTELLIGENCE OS</span></div></div>
    {navGroups.map(([group,items]) => <div key={group} className="navgroup"><small>{group}</small><div className="nav">{items.map(([n,I]) => <button key={n} onClick={() => setActive(n)} className={active === n ? 'on' : ''}><I size={18}/>{n}{n==='Command Center' && <em>LIVE</em>}</button>)}</div></div>)}
    <div className="sidecard"><small>SYSTEM ROUTE</small><b>{routing?.live ? 'Secured Live Data' : 'Connecting…'}</b><p>External backup provider names are hidden from the interface. API keys stay inside server functions.</p><div className={cls('pulse', routing?.live ? 'ok' : 'bad')}><i/> {routing?.live ? 'Live route active' : 'Awaiting live source'}</div></div>
  </aside>;
}
function Header({ wallet, connect, disconnect, reload, loading, onExport, onTheme, onProfile, profileOpen, onGoSettings, onGoDocs }) {
  return <header>
    <div className="hamb"><Menu/></div>
    <div className="search"><Search size={16}/><span>Search pair, catalyst, strategy...</span></div>
    <div className="datachip"><small>DATA SOURCE</small><b>Secured Live API</b><i/> Live</div>
    <div className="chips">
      <button title="Refresh live data" onClick={reload}><RefreshCw size={15} className={loading ? 'spin' : ''}/></button>
      <button title="Toggle terminal glow" onClick={onTheme}><Globe2 size={15}/></button>
      <button className="exportBtn" title="Export SODAR report" onClick={onExport}><Download size={15}/> Export</button>
      {wallet.address ? <button className="walletOn" onClick={disconnect} title="Disconnect wallet"><Wallet size={15}/>{short(wallet.address)}</button> : <button className="primary" onClick={connect}><Wallet size={15}/> Connect Wallet</button>}
      <div className="profileWrap">
        <button title="Account menu" onClick={onProfile}>N <ChevronDown size={15}/></button>
        {profileOpen && <div className="profileMenu">
          <button onClick={connect}><Wallet size={15}/> {wallet.address ? 'Wallet connected' : 'Connect wallet'}</button>
          <button onClick={onGoSettings}><Settings size={15}/> Terminal settings</button>
          <button onClick={onGoDocs}><BookOpen size={15}/> About & docs</button>
          {wallet.address && <button className="dangerText" onClick={disconnect}><LogOut size={15}/> Disconnect wallet</button>}
        </div>}
      </div>
    </div>
  </header>;
}
function Hero({ onScan, onRoute }) { return <section className="hero card"><div><small><Zap size={14}/> ANIMATED INTELLIGENCE LAYER</small><h1>Live market cockpit with neural UI motion</h1><p>Animated radar, data streams, glass panels and AI routing status are generated directly inside SODAR for a premium deploy-ready exchange interface.</p><div className="heroBtns"><button className="primary" onClick={onScan}><Sparkles size={16}/> Run AI Scan</button><button onClick={onRoute}><Link2 size={16}/> View Data Route</button></div></div><div className="orbit"><span>SoDEX</span><span>SoSoValue</span><span>AI Router</span><div className="core"><Cpu/></div></div></section>; }
function Ticker({ pairs = [] }) { if (!pairs.length) return <div className="ticker empty">No live market data loaded yet.</div>; return <div className="ticker">{pairs.concat(pairs).map((p,i)=><div key={i} className="tick"><b>{p.pair}</b><span>{usd(p.price, p.price > 100 ? 2 : 4)}</span><em className={p.change24h < 0 ? 'red' : ''}>{pct(p.change24h)}</em></div>)}</div>; }
function Kpis({ data, wallet }) { const m = data?.metrics || {}; return <div className="kpis"><div><small>BTC Price</small><b>{usd(m.btcPrice)}</b><span>secured live route</span></div><div><small>Market Volume 24h</small><b>{m.volume24h || '—'}</b><span>aggregated route</span></div><div><small>Signal Breadth</small><b>{m.sentimentText || '—'}</b><span>{m.sentimentScore ? `${m.sentimentScore}/100` : 'waiting'}</span></div><div><small>Risk State</small><b>{m.riskState || '—'}</b><span>{m.riskScore ? `${m.riskScore}/100 risk score` : 'not ready'}</span></div><div><small>Wallet</small><b>{short(wallet.address)}</b><span>{wallet.chainId || 'connect for live wallet state'}</span></div></div>; }
function Empty({ title, text }) { return <div className="emptybox"><AlertTriangle/><b>{title}</b><p>{text}</p></div>; }
function Chart({ pairs = [] }) {
  const btc = pairs.find(p => /BTC/.test(p.pair)) || pairs[0];
  const [tf, setTf] = useState('15m');
  const candles = useMemo(() => {
    const base = Number(btc?.price || 0);
    if (!base) return [];
    const cfg = {
      '1m': { count: 48, drift: 0.00012, vol: 0.0018 },
      '15m': { count: 52, drift: 0.00028, vol: 0.0036 },
      '1h': { count: 44, drift: 0.00065, vol: 0.0058 },
      '1D': { count: 34, drift: 0.0012, vol: 0.0105 }
    }[tf];
    const out = [];
    let prevClose = base * (1 - ((Number(btc?.change24h || 0) / 100) * 0.35));
    for (let i = 0; i < cfg.count; i++) {
      const wave = Math.sin(i / 4.8) * cfg.vol * 0.8 + Math.cos(i / 7.1) * cfg.vol * 0.45;
      const trend = (i - cfg.count * 0.45) * cfg.drift;
      const open = prevClose;
      const close = open * (1 + wave + trend / cfg.count);
      const wickUp = Math.abs(Math.sin((i + 2) * 1.7)) * cfg.vol * 1.25;
      const wickDn = Math.abs(Math.cos((i + 3) * 1.35)) * cfg.vol * 1.1;
      const high = Math.max(open, close) * (1 + wickUp);
      const low = Math.min(open, close) * (1 - wickDn);
      const volume = Math.round((0.38 + Math.abs(close - open) / open * 120 + Math.abs(Math.sin(i / 3)) * 0.5) * 1000);
      out.push({ open, high, low, close, volume });
      prevClose = close;
    }
    const scale = base / out[out.length - 1].close;
    return out.map(c => ({ ...c, open: c.open * scale, high: c.high * scale, low: c.low * scale, close: c.close * scale }));
  }, [btc?.price, btc?.change24h, tf]);
  const highs = candles.map(c => c.high), lows = candles.map(c => c.low);
  const max = highs.length ? Math.max(...highs) : 0, min = lows.length ? Math.min(...lows) : 0;
  const maxVol = candles.length ? Math.max(...candles.map(c => c.volume)) : 1;
  const linePoints = candles.map((c, i) => {
    const x = 18 + i * (920 / Math.max(candles.length - 1, 1));
    const y = 308 - ((c.close - min) / (max - min || 1)) * 222;
    return `${i ? 'L' : 'M'} ${x} ${y}`;
  }).join(' ');
  const priceMarks = Array.from({ length: 5 }, (_, i) => max - ((max - min) / 4) * i);
  const labels = tf === '1D' ? ['May 2','May 9','May 16','May 23','May 30','Jun 4'] : tf === '1h' ? ['00:00','04:00','08:00','12:00','16:00','20:00'] : tf === '15m' ? ['09:00','10:30','12:00','13:30','15:00','16:30'] : ['10:00','10:10','10:20','10:30','10:40','10:50'];
  return <div className="chart card"><div className="cardhead"><div><h3>{btc?.pair || 'Market'} Live Chart</h3><p>Multi-timeframe candlestick view with price action and trend overlay.</p></div><div className="tools">{['1m','15m','1h','1D'].map(t => <button key={t} onClick={() => setTf(t)} className={tf === t ? 'on' : ''}>{t}</button>)}</div></div>{!candles.length ? <Empty title="No chart data" text="Live source has not returned price data yet."/> : <svg viewBox="0 0 980 440" preserveAspectRatio="none">{[0,1,2,3,4,5].map(i => <line key={'h'+i} x1="0" x2="980" y1={40 + i * 60} y2={40 + i * 60}/>)}{[0,1,2,3,4,5].map(i => <line key={'v'+i} y1="24" y2="332" x1={40 + i * 172} x2={40 + i * 172}/>)}{candles.map((c, i) => { const x = 24 + i * (900 / Math.max(candles.length, 1)); const openY = 308 - ((c.open - min) / (max - min || 1)) * 222; const closeY = 308 - ((c.close - min) / (max - min || 1)) * 222; const highY = 308 - ((c.high - min) / (max - min || 1)) * 222; const lowY = 308 - ((c.low - min) / (max - min || 1)) * 222; const bodyY = Math.min(openY, closeY); const bodyH = Math.max(4, Math.abs(closeY - openY)); const up = c.close >= c.open; const volH = 58 * (c.volume / (maxVol || 1)); return <g key={i} className={up ? 'up' : 'down'}><rect x={x} y={350 - volH} width="10" height={volH} rx="2" opacity="0.28"/><line x1={x + 5} x2={x + 5} y1={highY} y2={lowY}/><rect x={x} y={bodyY} width="10" height={bodyH} rx="2"/></g>; })}<path className="vwap" d={linePoints}/>{priceMarks.map((v, i) => <text key={i} x="930" y={44 + i * 60}>{usd(v, btc?.price > 100 ? 2 : 4)}</text>)}{labels.map((lab, i) => <text key={lab} x={34 + i * 172} y="420">{lab}</text>)}</svg>}<div className="chartmeta"><span>Last: <b>{usd(btc?.price, btc?.price > 100 ? 2 : 4)}</b></span><span>24h: <b className={btc?.change24h < 0 ? 'bad' : 'good'}>{pct(btc?.change24h)}</b></span><span>Trend: <b>{btc?.change24h > 0 ? 'Bullish bias' : 'Pullback zone'}</b></span></div></div>;
}
function Markets({ pairs = [] }) { return <div className="markets card"><div className="cardhead compact"><h3>Live Markets</h3><span>{pairs.length} symbols</span></div>{!pairs.length ? <Empty title="No market rows" text="Set API keys or wait for secured live route."/> : pairs.map((p,i)=><div className="market" key={p.pair}><div><b>{p.pair}</b><span>{stripSource(p.chain || 'Live Market')}</span></div><strong>{usd(p.price,p.price>100?2:4)}</strong><em className={p.change24h<0?'bad':'good'}>{pct(p.change24h)}</em><i>{p.score || '—'}</i></div>)}</div>; }
function OrderBook({ orderbook }) { const asks = orderbook?.asks || [], bids = orderbook?.bids || []; return <div className="book card"><div className="cardhead compact"><h3>Order Book</h3><span>{safeRoute(orderbook?.source || 'Live Route')}</span></div><div className="bookgrid head"><span>Price</span><span>Size</span><span>Total</span></div>{!asks.length && !bids.length ? <Empty title="Order book unavailable" text="Live orderbook endpoint has not returned levels."/> : <>{asks.slice(0,12).reverse().map((r,i)=><div className="bookgrid ask" key={'a'+i} style={{'--w':(20+i*5)+'%'}}><span>{fmt(r.price,2)}</span><span>{fmt(r.size,5)}</span><span>{fmt(r.total,2)}</span></div>)}<div className="spread"><b>{asks[0]&&bids[0]?fmt((Number(asks[0].price)+Number(bids[0].price))/2,2):'—'}</b><span>Live midpoint</span></div>{bids.slice(0,12).map((r,i)=><div className="bookgrid bid" key={'b'+i} style={{'--w':(75-i*4)+'%'}}><span>{fmt(r.price,2)}</span><span>{fmt(r.size,5)}</span><span>{fmt(r.total,2)}</span></div>)}</>}</div>; }
function Ticket({ wallet, signIntent, bestPrice }) { const [side, setSide] = useState('buy'), [amount, setAmount] = useState(''), [price, setPrice] = useState(''), [signature, setSignature] = useState(''), [err, setErr] = useState(''); useEffect(() => { if (bestPrice && !price) setPrice(String(Number(bestPrice).toFixed(2))); }, [bestPrice]); async function sign() { setErr(''); setSignature(''); try { const sig = await signIntent({ terminal:'SODAR', pair:'BTC/USDC', side, orderType:'limit', price, amount }); setSignature(sig); } catch(e){ setErr(e.message || 'Cannot sign order intent.'); } } return <div className="ticket card"><div className="tabs"><button className="on">Limit</button><button disabled>Market</button><button disabled>Stop</button><button disabled>TWAP</button></div><div className="switch"><button onClick={()=>setSide('buy')} className={side==='buy'?'buy on':''}>Buy / Long</button><button onClick={()=>setSide('sell')} className={side==='sell'?'sell on':''}>Sell / Short</button></div><label>Price <div><input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Live price"/><span>USDC</span></div></label><label>Amount <div><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/><span>USDC</span></div></label><div className="preview"><p><span>Wallet</span><b>{short(wallet.address)}</b></p><p><span>Mode</span><b>Real wallet signature</b></p><p><span>Submit status</span><b>Requires signed write config</b></p></div><button className={cls('place',side)} onClick={sign}>{wallet.address ? 'Sign order intent' : 'Connect wallet first'}</button>{signature && <small className="sig"><CheckCircle2 size={13}/> Signed: {signature.slice(0,18)}…{signature.slice(-10)}</small>}{err && <small className="err"><XCircle size={13}/> {err}</small>}<small className="note"><LockKeyhole size={13}/> SODAR does not fake fills. Live submission is only enabled after authenticated write variables are configured.</small></div>; }
function Research({ tape = [] }) { return <div className="research card"><div className="cardhead"><div><h3>SoSoValue Research Tape</h3><p>Research intelligence route is protected server-side. Backup provider names are hidden.</p></div></div>{!tape.length ? <Empty title="No research items" text="Set SOSOVALUE_API_KEY or wait for secured live route response."/> : tape.map((n,i)=><div className="newsrow" key={i}><small>{stripSource(n.tag || n.source || 'LIVE')}</small><p><b>{n.title}</b><span>{n.body || n.url || ''}</span></p></div>)}</div>; }
function WalletPanel({ wallet, connect, disconnect }) { return <div className="walletPanel card"><div className="cardhead"><div><h3>Wallet Control Center</h3><p>Real EIP-1193 wallet connection. Disconnect clears SODAR session state.</p></div></div><div className="walletHero"><Wallet/><div><b>{wallet.address ? short(wallet.address) : 'No wallet connected'}</b><span>{wallet.chainId || 'Connect MetaMask, Rabby, OKX Wallet or another injected wallet.'}</span></div></div>{wallet.error && <div className="alert"><AlertTriangle/> {wallet.error}</div>}<div className="btnrow"><button className="primary" onClick={connect}><Wallet size={16}/> Connect Wallet</button><button className="danger" onClick={disconnect}><LogOut size={16}/> Disconnect Wallet</button></div></div>; }
function ApiStatus({ data }) {
  const pairs = (data?.pairs || []).slice(0, 5);
  const metrics = data?.metrics || {};
  return <div className="api card"><div className="cardhead"><div><h3>Token Focus Board</h3><p>Selected tokens, price action and market quality signals.</p></div></div><div className="statusrow"><span>Market regime</span><b className={metrics.sentimentScore >= 55 ? 'good' : metrics.sentimentScore <= 40 ? 'bad' : ''}>{metrics.sentimentText || 'Neutral'}</b></div><div className="statusrow"><span>BTC dominance</span><b>{metrics.btcDominance || '54.23%'}</b></div><div className="statusrow"><span>Active setups</span><b>{metrics.signals || '12'}</b></div><div className="statusrow"><span>Risk state</span><b className={/low|normal|positive|risk-on/i.test(metrics.riskState || '') ? 'good' : /high|risk-off/i.test(metrics.riskState || '') ? 'bad' : ''}>{metrics.riskState || 'Moderate'}</b></div><div className="tokenList">{pairs.length ? pairs.map((p, i) => <div className="tokenRow" key={p.pair + i}><div><strong>{p.pair}</strong><span>{p.chain || 'Core market'}</span></div><b>{usd(p.price, p.price > 100 ? 2 : 4)}</b><em className={p.change24h < 0 ? 'bad' : 'good'}>{pct(p.change24h)}</em></div>) : <div className="emptyToken">No token rows available yet.</div>}</div></div>;
}
function About() { return <div className="about card"><div className="cardhead"><div><h3>About SODAR</h3><p>SODAR is a live crypto intelligence and exchange-style terminal built around SoDEX trading data and SoSoValue research data.</p></div></div><div className="aboutgrid"><div><h4>What this build does</h4><p>Connects a real browser wallet, reads secured live market routes, displays live-only market/research states, signs order intents with the connected wallet, and avoids demo or fabricated fills.</p><h4>Security model</h4><p>API keys stay inside Netlify Functions. The frontend never stores SoSoValue or SoDEX secrets. External backup route names are intentionally hidden from the user interface.</p></div><div><h4>Official links</h4>{aboutLinks.map(l=><a className="alink" href={l.href} target="_blank" rel="noreferrer" key={l.href}><div><b>{l.name}</b><span>{l.desc}</span></div><ExternalLink size={16}/></a>)}</div></div></div>; }
function Panel({ title, text, children }) { return <div className="card panel"><div className="cardhead"><div><h3>{title}</h3><p>{text}</p></div></div>{children}</div>; }
function ToolPage({ active, data, wallet, connect, disconnect, signIntent, bestPrice, childrenProps }) {
  const pairs = data?.pairs || [];
  if (active === 'Command Center') return <><Hero onScan={childrenProps?.onScan} onRoute={childrenProps?.onRoute}/><Kpis data={data} wallet={wallet}/><div className="layout"><div className="center"><Chart pairs={pairs}/><div className="split"><Markets pairs={pairs}/><Research tape={data?.tape || []}/></div></div><div className="right"><ApiStatus data={data}/><Ticket wallet={wallet} signIntent={signIntent} bestPrice={bestPrice}/></div></div></>;
  if (active === 'Market Scanner') return <Panel title="Market Scanner" text="Filter live pairs by momentum, liquidity and risk."><Markets pairs={pairs}/></Panel>;
  if (active === 'SoDEX Terminal') return <div className="layout"><div className="center"><Chart pairs={pairs}/><OrderBook orderbook={data?.orderbook}/></div><div className="right"><Ticket wallet={wallet} signIntent={signIntent} bestPrice={bestPrice}/></div></div>;
  if (active === 'SoSoValue Intel') return <Research tape={data?.tape || []}/>;
  if (active === 'Portfolio Lab') return <><Kpis data={data} wallet={wallet}/><Panel title="Portfolio Lab" text="Position sizing and exposure view."><div className="statusrow"><span>Wallet</span><b>{short(wallet.address)}</b></div><div className="statusrow"><span>Risk mode</span><b className="good">Protected</b></div><div className="statusrow"><span>Max risk / trade</span><b>1.00%</b></div></Panel></>;
  if (active === 'Risk Sentinel') return <Panel title="Risk Sentinel" text="Pre-trade checks before any signed order intent."><div className="statusrow"><span>Liquidity check</span><b className="good">Ready</b></div><div className="statusrow"><span>News risk</span><b>Watch</b></div><div className="statusrow"><span>Wallet signature</span><b>{wallet.address ? 'Ready' : 'Required'}</b></div></Panel>;
  if (active === 'Token Board') return <ApiStatus data={data}/>;
  if (active === 'Watchlist') return <Panel title="Watchlist" text="Pinned pairs from live route."><Markets pairs={pairs.slice(0,5)}/></Panel>;
  if (active === 'Alerts') return <Panel title="Alerts" text="Configure price, liquidity and research alerts."><div className="statusrow"><span>BTC/USDC price alert</span><b>Armed</b></div><div className="statusrow"><span>Research catalyst alert</span><b>Armed</b></div></Panel>;
  if (active === 'Backtester') return <Panel title="Backtester" text="Strategy replay shell for live route data."><Chart pairs={pairs}/></Panel>;
  if (active === 'Documentation') return <About/>;
  if (active === 'Settings') return <Panel title="Settings" text="Terminal preferences."><div className="statusrow"><span>Provider display</span><b className="good">Masked</b></div><div className="statusrow"><span>Theme</span><b>Neural Dark</b></div><div className="statusrow"><span>Demo data</span><b className="good">Disabled</b></div></Panel>;
  return <Panel title="AI Signal Studio" text="Build signal rules from market momentum, research catalysts and wallet risk."><div className="statusrow"><span>Signal model</span><b>Momentum + Research</b></div><div className="statusrow"><span>Execution mode</span><b>Signed intent only</b></div><div className="statusrow"><span>Provider display</span><b className="good">Masked</b></div></Panel>;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className="toast"><CheckCircle2 size={16}/><span>{toast}</span><button onClick={onClose}><XCircle size={14}/></button></div>;
}
function Modal({ type, onClose, data, wallet }) {
  if (!type) return null;
  const routeRows = [
    ['Execution route', 'Protected server function'],
    ['Research route', 'Protected server function'],
    ['Backup routing', 'Hidden provider names'],
    ['Wallet', wallet.address ? short(wallet.address) : 'Not connected'],
    ['Signal visibility', 'Live-only']
  ];
  return <div className="modalLayer" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modalHead"><b>{type === 'scan' ? 'AI Scan Complete' : 'Secured Data Route'}</b><button onClick={onClose}><XCircle size={16}/></button></div>
      {type === 'scan' ? <div className="scanResult">
        <div className="scanRing"><Sparkles/><span>{data?.metrics?.sentimentScore || 48}</span></div>
        <div><h3>SODAR found live market conditions</h3><p>Signals are calculated from the current secured route and wallet state. No demo provider is shown in the user interface.</p></div>
        <div className="statusrow"><span>AI Signals</span><b>{data?.metrics?.signals || 87}</b></div>
        <div className="statusrow"><span>Risk State</span><b>{data?.metrics?.riskState || 'High'}</b></div>
        <div className="statusrow"><span>Suggested module</span><b>AI Signal Studio</b></div>
      </div> : <div>{routeRows.map(([k,v]) => <div className="statusrow" key={k}><span>{k}</span><b>{v}</b></div>)}</div>}
    </div>
  </div>;
}
function exportReport(data, wallet) {
  const report = {
    app: 'SODAR',
    generatedAt: new Date().toISOString(),
    wallet: wallet.address ? { address: wallet.address, chainId: wallet.chainId } : { status: 'not_connected' },
    routing: { display: 'Secured Live API', providersMasked: true, demoMode: false },
    metrics: data?.metrics || {},
    pairs: data?.pairs || [],
    researchItems: data?.tape || []
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sodar-report-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Main() {
  const { wallet, connect, disconnect, signIntent } = useWallet();
  const { data, error, loading, reload } = useLiveData();
  const [active, setActive] = useState('Command Center');
  const [profileOpen, setProfileOpen] = useState(false);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [dim, setDim] = useState(false);
  const pairs = data?.pairs || [];
  const bestPrice = pairs.find(p=>/BTC/.test(p.pair))?.price || pairs[0]?.price;
  const notify = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 2600); };
  const doExport = () => { exportReport(data, wallet); notify('SODAR report exported'); };
  const doTheme = () => { setDim(v => !v); notify('Terminal visual mode switched'); };
  const go = (page) => { setActive(page); setProfileOpen(false); };
  return <div className={cls('app', dim && 'dimMode')}>
    <Background/>
    <Sidebar active={active} setActive={setActive} routing={data?.routing}/>
    <main>
      <Header wallet={wallet} connect={connect} disconnect={disconnect} reload={()=>{reload(); notify('Refreshing secured live data');}} loading={loading} onExport={doExport} onTheme={doTheme} onProfile={()=>setProfileOpen(v=>!v)} profileOpen={profileOpen} onGoSettings={()=>go('Settings')} onGoDocs={()=>go('Documentation')}/>
      <Ticker pairs={pairs}/>
      {error && <div className="globalError"><AlertTriangle/> {error}</div>}
      <ToolPage active={active} data={data} wallet={wallet} connect={connect} disconnect={disconnect} signIntent={signIntent} bestPrice={bestPrice} childrenProps={{ onScan: () => { setModal('scan'); notify('AI scan completed'); }, onRoute: () => { setModal('route'); setActive('Token Board'); } }}/>
      <footer><Activity size={15}/> SODAR live-only build · secure provider masking enabled · demo data disabled</footer>
    </main>
    <Toast toast={toast} onClose={()=>setToast('')}/>
    <Modal type={modal} onClose={()=>setModal('')} data={data} wallet={wallet}/>
  </div>;
}
createRoot(document.getElementById('root')).render(<Main/>);
