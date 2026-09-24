import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/conforma-gsasp/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-192x192.png',
        'pwa-maskable-512x512.png',
        'apple-touch-icon.png',
        'data/*.json'
      ],
      manifest: {
        name: 'CONFORMA GSASP — Sistema de Conformidade',
        short_name: 'CONFORMA',
        description: 'Sistema de Conformidade e Apoio à Decisão do GSASP/SESP-MT (Protótipo Didático)',
        lang: 'pt-BR',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/conforma-gsasp/',
        start_url: '/conforma-gsasp/#/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: '/conforma-gsasp/index.html',
        navigateFallbackAllowlist: [/^\/conforma-gsasp\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/data/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'conforma-data-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
