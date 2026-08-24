/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  resolveSecurity,
  fetchLiveMarketQuote,
  fetchHistoricalMarketSeries,
  fetchCompanyNewsEvents,
  getDynamicTop10Opportunities,
  executeAiResearchWithGemini,
  getIndianMarketStatus,
} from './server/api';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
          const pathname = parsedUrl.pathname;
          res.setHeader('Content-Type', 'application/json');

          if (pathname === '/api/company/resolve') {
            const query = parsedUrl.searchParams.get('q') || '';
            const result = resolveSecurity(query);
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'SUCCESS', data: result }));
            return;
          }

          if (pathname === '/api/market/status') {
            const status = getIndianMarketStatus();
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'SUCCESS', data: status }));
            return;
          }

          if (pathname === '/api/market/quote') {
            const symbol = parsedUrl.searchParams.get('symbol') || '';
            if (!symbol) {
              res.statusCode = 400;
              res.end(JSON.stringify({ status: 'ERROR', message: 'Symbol query parameter is required' }));
              return;
            }
            try {
              const quote = await fetchLiveMarketQuote(symbol);
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SUCCESS', data: quote }));
            } catch (err: any) {
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SOURCE_UNAVAILABLE', message: err.message }));
            }
            return;
          }

          if (pathname === '/api/market/history') {
            const symbol = parsedUrl.searchParams.get('symbol') || '';
            const range = (parsedUrl.searchParams.get('range') || '1y') as any;
            if (!symbol) {
              res.statusCode = 400;
              res.end(JSON.stringify({ status: 'ERROR', message: 'Symbol is required' }));
              return;
            }
            try {
              const candles = await fetchHistoricalMarketSeries(symbol, range);
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SUCCESS', data: candles }));
            } catch (err: any) {
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SOURCE_UNAVAILABLE', message: err.message, data: [] }));
            }
            return;
          }

          if (pathname === '/api/market/top10') {
            try {
              const top10 = await getDynamicTop10Opportunities();
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SUCCESS', data: top10 }));
            } catch (err: any) {
              res.statusCode = 200;
              res.end(JSON.stringify({ status: 'SOURCE_UNAVAILABLE', message: err.message, data: [] }));
            }
            return;
          }

          if (pathname === '/api/news/fetch') {
            const symbol = parsedUrl.searchParams.get('symbol') || '';
            const name = parsedUrl.searchParams.get('name') || symbol;
            if (!symbol) {
              res.statusCode = 400;
              res.end(JSON.stringify({ status: 'ERROR', message: 'Symbol is required' }));
              return;
            }
            const news = await fetchCompanyNewsEvents(symbol, name);
            res.statusCode = 200;
            res.end(JSON.stringify({ status: 'SUCCESS', data: news }));
            return;
          }

          if (pathname === '/api/ai/research' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body || '{}');
                const aiResult = await executeAiResearchWithGemini(parsedBody);
                res.statusCode = 200;
                res.end(JSON.stringify(aiResult));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ status: 'ERROR', message: e.message }));
              }
            });
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ status: 'ERROR', message: `Route ${pathname} not found` }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ status: 'ERROR', message: err?.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  define: {
    'process.env': {},
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
