# SODAR

## What is inside

- React + Vite frontend
- Netlify Functions for API proxying
- SoSoValue API support through environment variables
- SoDEX-ready integration shell
- Automatic fallback routing: SoSoValue / SoDEX → Binance public API → CoinGecko public API → demo cache
- Real dashboard modules: Command Center, Market Scanner, SoDEX Terminal, SoSoValue Intel, AI Signal Studio, Portfolio Lab, Risk Sentinel, API Hub

## Local run

```bash
npm install
npm run dev
```

For Netlify Functions locally:

```bash
npm install -g netlify-cli
netlify dev
```

## Netlify deploy settings

```txt
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

## Optional environment variables

```txt
SOSOVALUE_API_KEY=your_key
SOSOVALUE_BASE_URL=https://api.sosovalue.com
SOSOVALUE_INTEL_PATH=/openapi/v1/news
SODEX_NETWORK=mainnet
SODEX_API_KEY_NAME=optional
SODEX_ACCOUNT_ID=optional
BINANCE_BASE_URL=https://api.binance.com
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

No key is required for demo/public fallback mode.
