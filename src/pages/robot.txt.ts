import type { APIRoute } from "astro"

function getRobotsTxt(sitemap: string): string {
  return `User-agent: *\nSitemap: ${sitemap}`
}

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site)
  return new Response(getRobotsTxt(sitemapURL.href))
}
