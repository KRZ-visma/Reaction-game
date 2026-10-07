/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const buildVersion =
  process.env.GITHUB_SHA?.slice(0, 7) ??
  new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

export default defineConfig({
  base: '/Reaction-game/',
  define: {
    __APP_VERSION__: JSON.stringify(
      `${process.env.npm_package_version ?? '0.1.0'}+${buildVersion}`,
    ),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Reaction-game',
        short_name: 'Reaction',
        description: 'Verzamel bolletjes via de camera',
        theme_color: '#0b1f2a',
        background_color: '#0b1f2a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/Reaction-game/',
        scope: '/Reaction-game/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: '/Reaction-game/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
