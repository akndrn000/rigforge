/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * URL publik situs, dipakai untuk canonical, Open Graph, robots.txt, dan sitemap.xml.
 * Urutan prioritas:
 *   1. SITE_URL (isi manual di Vercel > Settings > Environment Variables)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (otomatis diisi Vercel saat build)
 *   3. http://localhost:5173 (pengembangan lokal)
 */
function resolveSiteUrl(): string {
  const manual = process.env.SITE_URL?.trim()
  if (manual) return manual.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel}`
  return 'http://localhost:5173'
}

function siteMeta(siteUrl: string): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
          `</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), siteMeta(resolveSiteUrl())],
  build: { target: 'es2022', sourcemap: false },
  test: { environment: 'node' },
})
