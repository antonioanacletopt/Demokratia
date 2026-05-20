import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { getAllParties } from '@/lib/parties';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  
  const parties = await getAllParties();
  
  const articleEntries = articles.map(({ slug, frontmatter }) => ({
    url: `https://demokratia.pt/library/${slug}`,
    lastModified: new Date(frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const partyEntries = parties.map(({ slug }) => ({
    url: `https://demokratia.pt/partidos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://demokratia.pt',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://demokratia.pt/library',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://demokratia.pt/methodology',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://demokratia.pt/verificar',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://demokratia.pt/explorar',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://demokratia.pt/financas',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://demokratia.pt/map',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://demokratia.pt/partidos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...articleEntries,
    ...partyEntries,
  ];
}
