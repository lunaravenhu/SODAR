import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertCircle, Bell, BookOpen, Bot, BrainCircuit, CalendarClock, CandlestickChart, ChevronDown,
  CircleDollarSign, CloudLightning, Code2, Compass, Cpu, Download, Eye, Gauge, GitBranch, Globe2, Hexagon,
  LayoutDashboard, LineChart, Link2, Loader2, LockKeyhole, Menu, Moon, Network, Play, Radar, RefreshCw,
  Search, Settings, Shield, SlidersHorizontal, Sparkles, Target, TerminalSquare, Wallet, Zap
} from 'lucide-react';
import './styles.css';

const DEFAULT_PAIRS = [
  { pair: 'ETH/USDC', chain: 'Ethereum', price: 3812.45, change24h: 2.45, liquidity: 12450000, score: 87, icon: '◆' },
  { pair: 'BTC/USDC', chain: 'Bitcoin', price: 67842.10, change24h: 1.32, liquidity: 18320000, score: 82, icon: '₿' },
  { pair: 'SOL/USDC', chain: 'Solana', price: 164.32, change24h: 3.78, liquidity: 5210000, score: 78, icon: '◎' },
  { pair: 'ARB/USDC', chain: 'Arbitrum', price: 1.2345, change24h: 6.21, liquidity: 2310000, score: 75, icon: '△' },
  { pair: 'TON/USDC', chain: 'Toncoin', price: 6.5321, change24h: 4.11, liquidity: 1890000, score: 72, icon: '▽' },
  { pair: 'MATIC/USDC', chain: 'Polygon', price: 0.812, change24h: 2.95, liquidity: 1510000, score: 69, icon: '◇' },
  { pair: 'OP/USDC', chain: 'Optimism', price: 2.3456, change24h: 2.71, liquidity: 1320000, score: 67, icon: '●' }
];

const NAV = [
  ['Command Center', LayoutDashboard], ['Market Scanner', Radar], ['SoDEX Terminal', TerminalSquare], ['SoSoValue Intel', BrainCircuit],
  ['AI Signal Studio', Bot], ['Portfolio Lab', Wallet], ['Risk Sentinel', Shield], ['API Hub', Code2]
];
const TOOLS = [['Watchlist', Eye], ['Alerts', Bell], ['Backtester', GitBranch], ['Documentation', BookOpen], ['Settings', Settings]];
const TAPE = [
  { age: '2m', tag: 'ETF FLOW', title: 'BTC ETF netflow flips positive', body: 'Institutional flow improved while spot liquidity stayed constructive.', icon: '◈' },
  { age: '8m', tag: 'SODEX', title: 'ARB/USDC liquidity wall detected', body: 'Orderbook depth expanded near the top of book; slippage estimate dropped.', icon: '△' },
  { age: '15m', tag: 'MACRO', title: 'Dollar index cools into US session', body: 'Risk assets remain supported as traders reduce defensive positioning.', icon: '⌂' },
  { age: '22m', tag: 'ON-CHAIN', title: 'Large wallets accumulate ETH', body: 'Wallet cluster shows net accumulation across the previous hour.', icon: '◆' },
  { age: '34m', tag: 'AI', title: 'Sentiment engine raises SOL regime', body: 'Positive research density and bid-side depth push SOL into watch zone.', icon: '◎' }
];

const fmt = (n, digits = 2) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits });
const money = (n) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(2)}K` : `$${fmt(n)}`;
const cls = (...x) => x.filter(Boolean).join(' ');

function makeSeries(seed = 4, count = 72, amp = 34) {
  return Array.from({ length: count }, (_, i) => {
    const drift = i * 0.62;
    const wave = Math.sin((i + seed) / 5.2) * amp + Math.cos(i / 11) * 10;
    const noise = ((Math.sin(i * 9.1 + seed) + 1) * 5);
    return Math.max(8, 110 + drift + wave + noise);
  });
}

function ParticleMesh() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const particles = Array.from({ length: 86 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00055,
      vy: (Math.random() - 0.5) * 0.00055,
      r: 0.7 + Math.random() * 1.9,
      phase: Math.random() * Math.PI * 2,
      hue: i % 3
    }));
    function resize() {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function tick() {
      frame += 1;
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((a, i) => {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -0.02 || a.x > 1.02) a.vx *= -1;
        if (a.y < -0.02 || a.y > 1.02) a.vy *= -1;
        const ax = a.x * w, ay = a.y * h;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j], bx = b.x * w, by = b.y * h;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 135) {
            const alpha = (1 - d / 135) * 0.16;
            ctx.strokeStyle = a.hue === 0 ? `rgba(95, 240, 255, ${alpha})` : a.hue === 1 ? `rgba(147, 98, 255, ${alpha})` : `rgba(36, 255, 173, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          }
        }
        const pulse = 0.5 + Math.sin(frame / 40 + a.phase) * 0.5;
        ctx.fillStyle = a.hue === 0 ? `rgba(95, 240, 255, ${0.25 + pulse * 0.35})` : a.hue === 1 ? `rgba(147, 98, 255, ${0.2 + pulse * 0.35})` : `rgba(36, 255, 173, ${0.18 + pulse * 0.28})`;
        ctx.beginPath(); ctx.arc(ax, ay, a.r + pulse * 1.2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    }
    resize(); tick();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas className="particle-mesh" ref={ref} aria-hidden="true" />;
}
function HoloHero() {
  const nodes = ['SoSoValue', 'SoDEX', 'Binance', 'CoinGecko', 'AI Router'];
  return <section className="holo-hero card">
    <div className="hero-copy"><span className="eyebrow"><Zap size={14} /> animated intelligence layer</span><h2>Live market cockpit with neural UI motion</h2><p>Animated radar, data streams, glass panels, and AI routing status are generated directly inside the app for a premium deploy-ready interface.</p><div className="hero-actions"><button><Play size={15} /> Run AI Scan</button><button className="ghost"><Network size={15} /> View Data Route</button></div></div>
    <div className="holo-stage"><div className="orb-core"><Cpu size={42} /><span></span><i></i></div><div className="orbit one"></div><div className="orbit two"></div><div className="orbit three"></div>{nodes.map((n, i) => <b key={n} className={`node n${i}`}>{n}</b>)}<svg className="beam-map" viewBox="0 0 500 300" preserveAspectRatio="none"><path d="M250 145 C150 70 90 120 62 52"/><path d="M250 145 C350 75 425 102 448 50"/><path d="M250 145 C168 198 95 220 55 250"/><path d="M250 145 C340 212 414 213 450 248"/><path d="M250 145 C250 72 250 52 250 28"/></svg></div>
  </section>;
}
function MotionStrip() {
  return <div className="motion-strip"><div><span>AI SIGNALS</span><b>87</b></div><div><span>LIQUIDITY ROUTES</span><b>5</b></div><div><span>NEWS PULSE</span><b>LIVE</b></div><div><span>FALLBACK</span><b>AUTO</b></div><div><span>RISK ENGINE</span><b>ON</b></div></div>;
}

function Spark({ tone = 'cyan', seed = 3, small = false }) {
  const data = useMemo(() => makeSeries(seed, small ? 26 : 42, small ? 12 : 24), [seed, small]);
  const max = Math.max(...data), min = Math.min(...data);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * 160} ${70 - ((v - min) / (max - min || 1)) * 58}`).join(' ');
  return <svg className={cls('sparkline', tone, small && 'small')} viewBox="0 0 160 76" preserveAspectRatio="none"><path d={`${path} L 160 76 L 0 76 Z`} /><path d={path} /></svg>;
}
function DepthChart() {
  const asks = [15, 20, 25, 42, 45, 58, 64, 71, 86, 94];
  const bids = [88, 76, 71, 66, 54, 50, 37, 31, 22, 13];
  return <svg className="depth" viewBox="0 0 420 160" preserveAspectRatio="none">
    {[0, 1, 2, 3, 4].map(i => <line key={`h${i}`} x1="0" x2="420" y1={i * 38} y2={i * 38} />)}
    {[0, 1, 2, 3, 4, 5].map(i => <line key={`v${i}`} y1="0" y2="160" x1={i * 84} x2={i * 84} />)}
    <path className="bid-fill" d={`M 0 150 ${bids.map((v, i) => `L ${(i / 9) * 210} ${150 - v}`).join(' ')} L 210 150 Z`} />
    <path className="ask-fill" d={`M 210 150 ${asks.map((v, i) => `L ${210 + (i / 9) * 210} ${150 - v}`).join(' ')} L 420 150 Z`} />
    <path className="bid-line" d={bids.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 9) * 210} ${150 - v}`).join(' ')} />
    <path className="ask-line" d={asks.map((v, i) => `${i === 0 ? 'M' : 'L'} ${210 + (i / 9) * 210} ${150 - v}`).join(' ')} />
  </svg>;
}
function MarketChart() {
  const data = useMemo(() => makeSeries(8, 86, 38), []);
  const max = Math.max(...data), min = Math.min(...data);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * 1000} ${315 - ((v - min) / (max - min || 1)) * 260}`).join(' ');
  return <div className="market-chart">
    <svg viewBox="0 0 1000 340" preserveAspectRatio="none">
      {[0, 1, 2, 3, 4, 5, 6].map(i => <line key={`v${i}`} x1={i * 166.6} x2={i * 166.6} y1="0" y2="340" />)}
      {[0, 1, 2, 3, 4].map(i => <line key={`h${i}`} x1="0" x2="1000" y1={i * 78} y2={i * 78} />)}
      <path className="glow" d={path} />
      <path className="area" d={`${path} L 1000 340 L 0 340 Z`} />
      <path className="line" d={path} />
    </svg>
    <div className="axis"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div>
  </div>;
}
function Sidebar({ active, setActive }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-orb"><Hexagon size={30} /></div><div><h1>SODAR</h1><p>PRO INTELLIGENCE OS</p></div></div>
    <div className="nav-caption">CONTROL</div>
    {NAV.map(([label, Icon]) => <button key={label} onClick={() => setActive(label)} className={cls('nav-item', active === label && 'active')}><Icon size={18} /><span>{label}</span>{label === 'Command Center' && <b>LIVE</b>}</button>)}
    <div className="nav-caption">TOOLS</div>
    {TOOLS.map(([label, Icon]) => <button key={label} onClick={() => setActive(label)} className={cls('nav-item', active === label && 'active')}><Icon size={18} /><span>{label}</span></button>)}
    <div className="side-status"><div><span></span> OPERATIONAL</div><small>Auto router, functions, and public fallback are ready.</small><Spark small tone="green" seed={2} /></div>
  </aside>;
}
function Header({ active, data, loading, onRefresh }) {
  return <header className="header">
    <button className="hamb"><Menu size={20} /></button>
    <div className="title"><h2>{active}</h2><p>SoDEX execution intelligence + SoSoValue research layer + fallback public market data</p></div>
    <div className="search"><Search size={17} /><input placeholder="Search pair, catalyst, strategy..." /></div>
    <div className="source"><small>DATA SOURCE</small><b>{data?.source || 'Auto Router'}</b><span className={data?.live ? 'live' : 'standby'}>{data?.live ? '● Live' : '● Fallback'}</span></div>
    <button className="icon-btn" onClick={onRefresh}>{loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}</button>
    <button className="icon-btn"><Moon size={18} /></button>
    <button className="export"><Download size={16} /> Export</button>
    <div className="profile">N <ChevronDown size={14} /></div>
  </header>;
}
function Kpi({ icon: Icon, title, label, value, change, tone = 'purple', seed = 1 }) {
  return <section className={cls('kpi card', tone)}><div className="kpi-top"><span><Icon size={19} /></span><b>{title}</b></div><div className="kpi-body"><div><small>{label}</small><h3>{value}</h3><p className={change?.startsWith('-') ? 'red' : 'green'}>{change}</p></div><Spark tone={tone} seed={seed} /></div></section>;
}
function OpportunityTable({ pairs }) {
  return <section className="card table-card">
    <div className="card-head"><h3><Sparkles size={18} /> AI Opportunity Engine</h3><div className="head-actions"><button>Score Model</button><button>View All</button></div></div>
    <table className="op-table"><thead><tr><th>Asset</th><th>Price</th><th>24h</th><th>Liquidity</th><th>AI Setup</th><th>Score</th></tr></thead><tbody>{pairs.slice(0, 7).map((p, idx) => <tr key={p.pair}>
      <td><span className="coin">{p.icon}</span><div><b>{p.pair}</b><small>{p.chain}</small></div></td>
      <td><b>${fmt(p.price, p.price > 100 ? 2 : 4)}</b><small>spread {idx % 2 ? '0.07' : '0.04'}%</small></td>
      <td className={p.change24h >= 0 ? 'green' : 'red'}>{p.change24h >= 0 ? '+' : ''}{fmt(p.change24h)}%</td>
      <td>{money(p.liquidity)}</td>
      <td><span className={cls('pill', idx < 3 ? 'hot' : 'ok')}>{idx < 3 ? 'Momentum + Intel' : 'Watchlist'}</span></td>
      <td><span className="score">{p.score}</span></td>
    </tr>)}</tbody></table>
  </section>;
}
function MarketOverview({ data }) {
  return <section className="card market-card">
    <div className="card-head"><h3><LineChart size={18} /> Market Overview</h3><div className="tabs"><span>1H</span><span>4H</span><b>1D</b><span>1W</span></div></div>
    <div className="market-meta"><div><small>TOTAL MARKET CAP</small><h3>{data?.metrics?.marketCap || '$2.56T'} <span>▲ 1.85%</span></h3></div><div><small>ACTIVE SIGNALS</small><h3>{data?.metrics?.opportunities || 12}</h3></div><div><small>REGIME</small><h3 className="cyan">Risk-on</h3></div></div>
    <MarketChart />
    <div className="mini-stats"><div><small>24H Volume</small><b>{data?.metrics?.volume24h || '$89.32B'}</b><span>+6.21%</span></div><div><small>BTC Price</small><b>${fmt(data?.metrics?.btcPrice || 67842.1)}</b><span>+1.32%</span></div><div><small>Signal Reliability</small><b>{Math.max(72, (data?.metrics?.sentimentScore || 72))}%</b><span>+4.8%</span></div></div>
  </section>;
}
function ResearchTape({ tape }) {
  return <section className="card tape-card"><div className="card-head"><h3><Globe2 size={18} /> SoSoValue Research Tape</h3><button>View Intel</button></div>{(tape?.length ? tape : TAPE).slice(0, 6).map((x, i) => <article key={i}><span className="tape-ico">{x.icon}</span><div><p><small>{x.age}</small><em>{x.tag}</em></p><b>{x.title}</b><span>{x.body}</span></div></article>)}</section>;
}
function Terminal({ pair }) {
  const book = [0.12, 0.18, 0.22, 0.31, 0.46, 0.58].map((q, i) => ({ price: (pair.price * (1 + (i + 1) / 900)).toFixed(pair.price > 100 ? 2 : 4), qty: (q * 1000).toFixed(2), side: 'ask' }))
    .concat([0.51, 0.44, 0.32, 0.24, 0.15, 0.11].map((q, i) => ({ price: (pair.price * (1 - (i + 1) / 950)).toFixed(pair.price > 100 ? 2 : 4), qty: (q * 1000).toFixed(2), side: 'bid' })));
  return <section className="card terminal-card"><div className="card-head"><h3><CandlestickChart size={18} /> SoDEX Terminal</h3><div className="pair-chip">{pair.pair}</div></div>
    <DepthChart /><div className="book"><div className="book-head"><span>Price</span><span>Size</span><span>Route</span></div>{book.map((r, i) => <div className={cls('book-row', r.side)} key={i}><span>{r.price}</span><span>{r.qty}</span><span>{r.side === 'ask' ? 'Seller' : 'Buyer'}</span></div>)}</div>
  </section>;
}
function StrategyStudio({ pair }) {
  const rules = [
    ['SoSoValue sentiment', 'score > 60', BrainCircuit, 'green'],
    ['SoDEX momentum', '24h change > 2%', Radar, 'cyan'],
    ['Liquidity depth', '>$1M mapped', Gauge, 'purple'],
    ['Risk filter', 'max drawdown guard', Shield, 'orange']
  ];
  return <section className="card studio-card"><div className="card-head"><h3><Bot size={18} /> AI Signal Studio</h3><button><Play size={14} /> Simulate</button></div>
    <div className="studio"><div className="rules"><b>IF</b>{rules.map(([a, b, Icon, tone]) => <div className="rule" key={a}><Icon size={18} /><div><strong>{a}</strong><small>{b}</small></div><span className={tone}></span></div>)}</div><div className="flow"><i></i><span>THEN</span><i></i></div><div className="actions"><div className="action buy">BUY <small>{pair.pair}</small></div><div className="action tp">TAKE PROFIT <small>2.0R</small></div><div className="action sl">STOP LOSS <small>1.0R</small></div></div></div>
  </section>;
}
function PortfolioLab({ pair }) {
  const [balance, setBalance] = useState(10000); const [risk, setRisk] = useState(1); const [stop, setStop] = useState(pair.price * 0.96); const [target, setTarget] = useState(pair.price * 1.12);
  useEffect(() => { setStop(pair.price * 0.96); setTarget(pair.price * 1.12); }, [pair.price]);
  const riskAmt = balance * risk / 100; const unitRisk = Math.max(0.0001, pair.price - stop); const size = riskAmt / unitRisk; const rr = (target - pair.price) / unitRisk;
  return <section className="card portfolio-card"><div className="card-head"><h3><Wallet size={18} /> Portfolio Lab</h3><span className="safe">paper mode</span></div>
    <div className="inputs"><label>Balance<input value={balance} onChange={e => setBalance(+e.target.value || 0)} /></label><label>Risk %<input value={risk} onChange={e => setRisk(+e.target.value || 0)} /></label><label>Entry<input readOnly value={fmt(pair.price, pair.price > 100 ? 2 : 4)} /></label><label>Stop<input value={fmt(stop, 4)} onChange={e => setStop(+e.target.value || 0)} /></label><label>Target<input value={fmt(target, 4)} onChange={e => setTarget(+e.target.value || 0)} /></label></div>
    <div className="position-box"><small>POSITION SIZE</small><b>{fmt(size, 4)} <em>{pair.pair.split('/')[0]}</em></b><p>{money(size * pair.price)} notional</p><div><span>Risk</span><strong>{money(riskAmt)}</strong></div><div><span>R:R</span><strong>1 : {fmt(rr)}</strong></div></div>
  </section>;
}
function RiskPanel({ data }) {
  const rows = [['Market trend', 'Bullish', 'ok'], ['Volatility', 'Moderate', 'warn'], ['Funding rate', 'Normal', 'ok'], ['Liquidation risk', 'Low', 'ok'], ['News sentiment', data?.metrics?.sentimentText || 'Bullish', 'ok']];
  return <section className="card risk-card"><div className="card-head"><h3><Shield size={18} /> Risk Sentinel</h3><span className="risk-score">{data?.metrics?.riskScore || 38}/100</span></div>{rows.map(([a, b, s]) => <div className="risk-row" key={a}><span>{a}</span><b className={s}>{b}</b><em>{s === 'ok' ? '✓' : '!'}</em></div>)}<button className="full-btn">View Full Report</button></section>;
}
function Heatmap({ pairs }) {
  return <section className="card heat-card"><div className="card-head"><h3><Activity size={18} /> Market Heatmap</h3><button>Gainers</button></div><div className="heat-grid">{pairs.slice(0, 7).map((p, i) => <div key={p.pair} className={cls('heat-cell', p.change24h < 0 && 'bad')} style={{ gridColumn: i < 2 ? 'span 2' : 'span 1', minHeight: i < 2 ? 90 : 72 }}><b>{p.pair}</b><span>{p.change24h >= 0 ? '+' : ''}{fmt(p.change24h)}%</span><small>{money(p.liquidity)}</small></div>)}</div></section>;
}
function ApiHub({ data }) {
  const r = data?.routing || {}; const routes = [
    ['SoSoValue API', r.primary || 'auto', data?.source?.includes('SoSo') ? 'Live' : 'Standby', BrainCircuit],
    ['SoDEX API', 'market + planning', r.sodex || 'Standby', Hexagon],
    ['Binance Public', 'free fallback', r.fallback1 || 'Standby', CloudLightning],
    ['CoinGecko Public', 'free fallback', r.fallback2 || 'Standby', Globe2],
    ['Demo Cache', 'last-resort', r.demo || 'OFF', LockKeyhole]
  ];
  return <section className="card api-card"><div className="card-head"><h3><Code2 size={18} /> API Router</h3><button>Env Setup</button></div>{routes.map(([a, b, s, Icon]) => <div className="api-row" key={a}><Icon size={18} /><div><b>{a}</b><small>{b}</small></div><span className={s === 'Live' || s === 'ON' ? 'live' : 'standby'}>{s}</span></div>)}</section>;
}
function ScannerPage({ pairs }) {
  return <div className="page scanner"><section className="card scanner-panel"><div className="card-head"><h3><SlidersHorizontal size={18} /> Advanced Market Scanner</h3><button>Run Scan</button></div><div className="scanner-filters"><label>Chain<select><option>All chains</option><option>Ethereum</option><option>Solana</option></select></label><label>Min Liquidity<select><option>$1M+</option><option>$5M+</option><option>$10M+</option></select></label><label>Risk<select><option>Low / Moderate</option><option>Low only</option></select></label><label>Signal Type<select><option>Momentum + News</option><option>Liquidity expansion</option></select></label></div><OpportunityTable pairs={pairs} /></section><Heatmap pairs={pairs} /></div>;
}
function Placeholder({ active, pairs, data }) {
  const pair = pairs[0] || DEFAULT_PAIRS[0];
  if (active === 'Market Scanner') return <ScannerPage pairs={pairs} />;
  if (active === 'SoDEX Terminal') return <div className="page two"><Terminal pair={pair} /><OpportunityTable pairs={pairs} /></div>;
  if (active === 'SoSoValue Intel') return <div className="page two"><ResearchTape tape={data?.tape} /><MarketOverview data={data} /></div>;
  if (active === 'AI Signal Studio') return <div className="page two"><StrategyStudio pair={pair} /><RiskPanel data={data} /></div>;
  if (active === 'Portfolio Lab') return <div className="page two"><PortfolioLab pair={pair} /><MarketOverview data={data} /></div>;
  if (active === 'Risk Sentinel') return <div className="page two"><RiskPanel data={data} /><ApiHub data={data} /></div>;
  if (active === 'API Hub') return <div className="page two"><ApiHub data={data} /><section className="card env-card"><h3><LockKeyhole size={18} /> Netlify Environment</h3><code>SOSOVALUE_API_KEY=your_key\nSOSOVALUE_BASE_URL=https://api.sosovalue.com\nSODEX_API_KEY_NAME=optional\nSODEX_NETWORK=mainnet</code><p>Keys stay inside Netlify Functions. Frontend calls only /.netlify/functions/*.</p></section></div>;
  return <div className="page two"><section className="card env-card"><h3><AlertCircle size={18} /> {active}</h3><p>This professional shell is ready for this module. It keeps the same design language and can be extended with new function endpoints.</p></section><MarketOverview data={data} /></div>;
}
function Dashboard({ data }) {
  const pairs = data?.pairs?.length ? data.pairs : DEFAULT_PAIRS; const pair = pairs[0];
  return <>
    <HoloHero />
    <MotionStrip />
    <div className="kpi-row"><Kpi icon={Gauge} title="Market Pulse" label="BTC dominance" value={`${fmt(data?.metrics?.btcDominance || 54.23)}%`} change={`▲ ${fmt(data?.metrics?.btcDominanceChange || 0.68)}% (24h)`} tone="cyan" seed={2} /><Kpi icon={Target} title="SoDEX Opportunities" label="high-quality setups" value={data?.metrics?.opportunities || 12} change="▲ 3 today" tone="purple" seed={4} /><Kpi icon={BrainCircuit} title="SoSoValue Sentiment" label="overall sentiment" value={`${data?.metrics?.sentimentScore || 72}/100`} change={data?.metrics?.sentimentText || 'Bullish'} tone="green" seed={7} /><Kpi icon={Shield} title="Risk State" label="market risk level" value={data?.metrics?.riskState || 'Moderate'} change={`Score ${data?.metrics?.riskScore || 38}/100`} tone="orange" seed={9} /></div>
    <div className="dash-grid"><OpportunityTable pairs={pairs} /><MarketOverview data={data} /><ResearchTape tape={data?.tape} /></div>
    <div className="module-grid"><Terminal pair={pair} /><StrategyStudio pair={pair} /><PortfolioLab pair={pair} /><RiskPanel data={data} /><Heatmap pairs={pairs} /><ApiHub data={data} /></div>
    <Footer data={data} />
  </>;
}
function Footer({ data }) {
  return <footer className="footer-status"><div className="footer-icon"><Shield size={28} /></div><div><h3>Auto Fallback Status</h3><p>Primary APIs are used first. If SoDEX or SoSoValue fails, routing switches silently to Binance, CoinGecko, then demo cache.</p></div><div className="route"><small>PRIMARY</small><b>SoSoValue API</b><span className={data?.source?.includes('SoSo') ? 'live' : 'standby'}>{data?.source?.includes('SoSo') ? 'Live' : 'Standby'}</span></div><div className="route"><small>MARKET</small><b>SoDEX API</b><span className="standby">Standby</span></div><div className="route"><small>FALLBACK 1</small><b>Binance API</b><span className={data?.source?.includes('Binance') ? 'live' : 'standby'}>{data?.source?.includes('Binance') ? 'Live' : 'Standby'}</span></div><div className="route"><small>FALLBACK 2</small><b>CoinGecko API</b><span className={data?.source?.includes('CoinGecko') ? 'live' : 'standby'}>{data?.source?.includes('CoinGecko') ? 'Live' : 'Standby'}</span></div><div className="route"><small>DEMO</small><b>Cache</b><span className={data?.source === 'Demo' ? 'live' : 'off'}>{data?.source === 'Demo' ? 'ON' : 'OFF'}</span></div></footer>;
}
function App() {
  const [active, setActive] = useState('Command Center');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { const res = await fetch('/.netlify/functions/intelligence'); if (!res.ok) throw new Error(`${res.status} ${res.statusText}`); setData(await res.json()); }
    catch (e) { setError(`Function route unavailable: ${e.message}. Demo data is displayed until Netlify Functions are available.`); setData({ source: 'Demo', live: false, metrics: { btcDominance: 54.23, btcDominanceChange: 0.68, opportunities: 12, sentimentScore: 72, sentimentText: 'Bullish', riskState: 'Moderate', riskScore: 38, marketCap: '$2.56T', volume24h: '$89.32B', btcPrice: 67842.1 }, pairs: DEFAULT_PAIRS, tape: TAPE }); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const pairs = data?.pairs?.length ? data.pairs : DEFAULT_PAIRS;
  return <div className="app"><ParticleMesh /><Sidebar active={active} setActive={setActive} /><main><Header active={active} data={data} loading={loading} onRefresh={load} />{error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}{active === 'Command Center' ? <Dashboard data={data} /> : <Placeholder active={active} pairs={pairs} data={data} />}</main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
