# SODAR — Live Exchange Terminal

SODAR is a live-only crypto intelligence and exchange-style terminal for SoDEX + SoSoValue workflows.

## Latest update

- Provider names for backup routes are hidden from the frontend UI.
- Header now displays only `Secured Live API` instead of external public fallback names.
- Sidebar menus are interactive: Command Center, Market Scanner, SoDEX Terminal, SoSoValue Intel, AI Signal Studio, Portfolio Lab, Risk Sentinel, API Hub, Watchlist, Alerts, Backtester, Documentation and Settings.
- About page keeps only official SoDEX and SoSoValue links.
- Demo/mock data remains disabled.
- Real wallet connect / disconnect through injected EIP-1193 wallets such as MetaMask, Rabby and OKX Wallet.
- Order panel signs a real wallet intent with `personal_sign`; it does not fake order fills.
- API keys stay server-side in Netlify Functions.

## Netlify deploy

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Functions directory:

```bash
netlify/functions
```

Recommended environment variables:

```bash
NODE_VERSION=20
SOSOVALUE_API_KEY=your_key
```

Optional route overrides can stay in Netlify only. They are masked in the UI.

## Local run

```bash
npm install
npm run dev
```

## Important trading note

SODAR does not simulate fills and does not claim an order is placed unless a signed write route is configured. Current order panel signs a real wallet intent for audit/approval. Live order submission requires the authenticated signing workflow from official SoDEX documentation.
