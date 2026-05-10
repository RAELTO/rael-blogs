module.exports = {
  ci: {
    collect: {
      // Levanta el servidor de preview del build y mide estas URLs
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      url: [
        'http://localhost:4173/',        // Home feed (público)
        'http://localhost:4173/login',   // Login page
      ],
      numberOfRuns: 2,
    },
    assert: {
      // Umbrales como warnings — ajustar a errors cuando haya baseline estable
      assertions: {
        'categories:performance':    ['warn', { minScore: 0.75 }],
        'categories:accessibility':  ['warn', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo':            ['warn', { minScore: 0.80 }],
        'largest-contentful-paint':  ['warn', { maxNumericValue: 4000 }],
        'total-blocking-time':       ['warn', { maxNumericValue: 400 }],
        'cumulative-layout-shift':   ['warn', { maxNumericValue: 0.15 }],
        'first-contentful-paint':    ['warn', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      // Sube resultados a almacenamiento temporal público de LHCI (gratis, 7 días)
      target: 'temporary-public-storage',
    },
  },
}
