import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/parties');

export interface PartyFrontmatter {
  name: string;
  acronym: string;
  founded: number;
  spectrum: string;
  website: string;
  color: string;
  textColor: string;
  logo: string;
  logoBg?: string;
}

export async function getAllParties(): Promise<{ slug: string; frontmatter: PartyFrontmatter }[]> {
  try {
    const filenames = await fs.readdir(contentDirectory);

    const parties = await Promise.all(
      filenames.filter(f => f.endsWith('.mdx')).map(async (filename) => {
        const filePath = path.join(contentDirectory, filename);
        const fileContents = await fs.readFile(filePath, 'utf8');
        const { data } = matter(fileContents);
        return {
          slug: filename.replace(/\.mdx?$/, ''),
          frontmatter: data as PartyFrontmatter,
        };
      })
    );

    // Sort alphabetically by Acronym
    return parties.sort((a, b) => a.frontmatter.acronym.localeCompare(b.frontmatter.acronym));
  } catch (error) {
    return [];
  }
}

export async function getPartyBySlug(slug: string): Promise<{ frontmatter: PartyFrontmatter; content: string } | null> {
  const filePath = path.join(contentDirectory, `${slug}.mdx`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      frontmatter: data as PartyFrontmatter,
      content,
    };
  } catch (error) {
    return null;
  }
}
