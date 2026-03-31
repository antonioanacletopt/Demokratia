import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/library');

export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
}

export async function getAllArticles(): Promise<{ slug: string; frontmatter: Frontmatter }[]> {
  const filenames = await fs.readdir(contentDirectory);

  const articles = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(contentDirectory, filename);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug: filename.replace(/\.mdx?$/, ''),
        frontmatter: data as Frontmatter,
      };
    })
  );

  return articles.sort((a, b) => 
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function getArticleBySlug(slug: string): Promise<{ frontmatter: Frontmatter; content: string } | null> {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      frontmatter: data as Frontmatter,
      content,
    };
  } catch (error) {
    return null;
  }
}
