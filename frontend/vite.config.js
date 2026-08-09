import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Allow Cloudflare / ngrok tunnel hosts so the dev server doesn't reject
  // requests forwarded from a public tunnel URL during live testing.
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app'],
  },
  preview: {
    host: true,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app'],
  },
  // Guarantee a single React instance across eager + lazy chunks. Without this,
  // Vite's on-the-fly optimization of lazy-only deps can bind a second React
  // copy -> null hook dispatcher -> "Cannot read properties of null
  // (reading 'useContext')" on lazy-loaded pages.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Pre-bundle heavy libs used only by lazy pages so no mid-session
    // re-optimization (and duplicate React) happens on navigation.
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'framer-motion',
      'recharts',
      '@xyflow/react',
      'react-window',
      'mermaid',
      '@monaco-editor/react',
      'lodash',
      'axios',
      'socket.io-client',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'CodeViz',
        short_name: 'CodeViz',
        description: 'Interactive Coding Platform',
        theme_color: '#1e1e1e',
        background_color: '#1e1e1e',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2721/2721620.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2721/2721620.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache local API responses for read operations (optional, maybe too complex for now)
            // But we do need to cache Monaco Editor assets if they are loaded from CDN
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'monaco-editor-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
