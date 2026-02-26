
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://demokratia.pt'
  
  const routes = [
    '',
    '/home',
    '/explorer',
    '/budget',
    '/simulations',
    '/scenarios',
    '/fact-check',
    '/legislation',
    '/proposals',
    '/methodology',
    '/about',
    '/faq',
    '/contact',
    '/terms',
    '/privacy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '/home' ? 'daily' : 'weekly',
    priority: route === '' || route === '/home' ? 1 : 0.8,
  }))
}
