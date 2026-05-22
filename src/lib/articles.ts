/**
 * articles.ts — wrapper that uses static imports instead of fs.readdir/fs.readFile.
 * Cloudflare Workers do not have access to the filesystem at runtime, so we
 * embed all article content at build time in articles-static.ts.
 */
import { getAllArticlesStatic, getArticleBySlugStatic } from './articles-static';

export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
}

export async function getAllArticles(): Promise<{ slug: string; frontmatter: Frontmatter }[]> {
  return getAllArticlesStatic();
}

export async function getArticleBySlug(slug: string): Promise<{ frontmatter: Frontmatter; content: string } | null> {
  return getArticleBySlugStatic(slug);
}
