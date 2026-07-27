import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const prerender = require('vite-plugin-prerender')
import { compression } from 'vite-plugin-compression2'

interface PuppeteerConsoleMessage {
  text: () => string;
}

interface PrerenderedRoute {
  html: string;
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Conditionally include prerender plugin only in non-CI environments
const prerenderPlugin = process.env.CI === 'true' ? null : prerender({
  staticDir: path.join(__dirname, 'dist'),
  routes: [
    '/',
    '/about',
    '/learn',
    '/learn/o-que-e-python',
    '/learn/por-que-aprender-python',
    '/learn/python-para-criancas',
    '/learn/primeiros-passos-python',
    '/learn/jogos-aprender-programacao',
    '/learn/como-ensinar-python-criancas',
    '/learn/exercicios-python-criancas',
    '/learn/scratch-vs-python',
    '/learn/projetos-python-criancas',
    '/python-para-criancas',
    '/aprender-python-jogando',
    '/login',
    '/register'
  ],
  renderer: new prerender.PuppeteerRenderer({
    renderAfterTime: 2000,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ],
    maxConcurrentRoutes: 4,
    // No CI, o console do Puppeteer ajudará a identificar erros na aplicação
    consoleHandler(msg: PuppeteerConsoleMessage) {
      console.log('[Puppeteer Console]', msg.text());
    }
  }),
  postProcess(renderedRoute: PrerenderedRoute) {
    renderedRoute.html = renderedRoute.html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match: string) => {
        return match;
      });
    return renderedRoute;
  },
})

// https://vite.dev/config/
export default defineConfig({
  envPrefix: 'VITE_',
  plugins: [
    {
      name: 'defer-css',
      enforce: 'post',
      transformIndexHtml(html) {
        const withDeferredCss = html.replace(
          /<link([^>]+)rel="stylesheet"([^>]*)href="([^"]+)"([^>]*)>/gi,
          (match, _p1, _p2, p3) => {
            // Se já for print ou tiver onload, não mexe
            if (match.includes('media="print"')) return match;

            return `<link rel="preload" href="${p3}" as="style" onload="this.onload=null;this.rel='stylesheet'" crossorigin><noscript><link rel="stylesheet" crossorigin href="${p3}"></noscript>`;
          }
        );

        // Remove preloads de módulos grandes que não são críticos para a Home.
        return withDeferredCss.replace(
          /<link\s+rel="modulepreload"[^>]*href="[^"]*(monaco-vendor|jspdf-vendor|html2canvas-vendor)[^"]*"[^>]*>\s*/gi,
          ''
        );
      }
    },
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'PyExplorer - Aprenda Python Brincando',
        short_name: 'PyExplorer',
        description: 'Jogo educativo para ensinar Python para crianças de forma divertida',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'games', 'kids'],
        lang: 'pt-BR',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Tela inicial do PyExplorer'
          },
          {
            src: '/screenshots/screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'PyExplorer no celular'
          }
        ]
      },
      workbox: {
        // Skip waiting para aplicar updates imediatamente
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/robots.txt$/, /^\/__\//],

        // Cache de recursos estáticos
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Aumenta o limite de tamanho para caching (Monaco Editor é grande)
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

        // Cache de runtime para diferentes recursos
        runtimeCaching: [
          {
            // Cache para Google Fonts (stylesheets)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache para arquivos de fontes (woff2, etc)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache para Pyodide CDN
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pyodide-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache para API Firebase (questões)
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache para Firebase Auth (iframe.js tem cache curto do servidor)
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'firebase-auth-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Desabilitar em dev para não poluir
      }
    }),
    ...(prerenderPlugin ? [prerenderPlugin] : []),
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240, // 10kb
    })
  ],
  build: {
    modulePreload: {
      // Evita preload agressivo de chunks não críticos na home
      // (ex.: bibliotecas usadas apenas em fluxos específicos).
      resolveDependencies: (_url, deps) =>
        deps.filter((dep) =>
          !dep.includes('monaco-vendor') &&
          !dep.includes('jspdf-vendor') &&
          !dep.includes('html2canvas-vendor')
        )
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/') || id.includes('/node_modules/scheduler/')) {
              return 'react-vendor';
            }
            if (id.includes('canvas-confetti')) {
              return 'confetti-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // Enable minification
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Remove console.* and debugger in production builds
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 5173,
    strictPort: true
  }
})
