import type { APIRoute } from 'astro'

function getRobotsTxt(sitemapURL: URL): string {
  // This is intentional; template literals don’t outdent properly.
  return `User-agent: *

Sitemap: ${sitemapURL.href}
`
}

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site)
  return new Response(getRobotsTxt(sitemapURL))
}
