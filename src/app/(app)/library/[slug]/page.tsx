import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { SocialShare } from '@/components/SocialShare';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const articles = await getAllArticles();

  if (!articles) {
    return [];
  }

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function LibraryArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container max-w-3xl py-8">
      <article>
        <h1 className="text-4xl font-bold mb-2">{article.frontmatter.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">{article.frontmatter.description}</p>
        <div className="mb-8">
          <SocialShare title={article.frontmatter.title} description={article.frontmatter.description} />
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <MDXRemote source={article.content} />
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
    const article = await getArticleBySlug(params.slug);

    if (!article) {
        return {
            title: 'Artigo não encontrado'
        }
    }

    return {
        title: article.frontmatter.title,
        description: article.frontmatter.description,
    }
}
