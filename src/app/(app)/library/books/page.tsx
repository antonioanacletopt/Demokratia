import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getT, Language } from '@/lib/i18n-server';

const recommendedBooks = [
  {
    title: 'A Riqueza das Nações',
    author: 'Adam Smith',
    description: 'A obra fundadora da economia moderna (1776). Explora a divisão do trabalho, a origem do dinheiro e a famosa "mão invisível" do mercado livre.',
    link: 'https://archive.org/details/ariquezadasnacoesadamsmith/mode/2up', // Archive.org PT
    isFree: true
  },
  {
    title: 'O Capital (Livro I)',
    author: 'Karl Marx',
    description: 'A crítica fundacional à economia política capitalista. Marx disseca a mercadoria, o processo de troca e a extração da "mais-valia" pelo capital.',
    link: 'https://www.marxists.org/portugues/marx/1867/ocapital-v1/', // Marxists PT
    isFree: true
  },
  {
    title: 'O Príncipe',
    author: 'Nicolau Maquiavel',
    description: 'Um dos tratados políticos mais influentes da história. Explora o realismo político, a conquista e a manutenção do poder governativo.',
    link: 'http://www.dominiopublico.gov.br/download/texto/cv000052.pdf', // Dominio Publico
    isFree: true
  },
  {
    title: 'O Contrato Social',
    author: 'Jean-Jacques Rousseau',
    description: 'A base teórica da Revolução Francesa e da democracia moderna. Argumenta que a autoridade política legítima assenta num pacto social.',
    link: 'http://www.dominiopublico.gov.br/download/texto/cv000024.pdf', // Dominio Publico
    isFree: true
  },
  {
    title: 'A Origem da Família, da Propriedade Privada e do Estado',
    author: 'Friedrich Engels',
    description: 'Um tratado sociológico e histórico que traça a evolução das estruturas sociais humanas desde o comunismo primitivo até ao Estado de classes.',
    link: 'https://www.marxists.org/portugues/marx/1884/origem/', // Marxists PT
    isFree: true
  },
  {
    title: 'Teoria Geral do Emprego, do Juro e da Moeda',
    author: 'John Maynard Keynes',
    description: 'O livro que mudou a macroeconomia (1936). Defende a intervenção direta do Estado na economia para combater o desemprego em tempos de crise.',
    link: 'https://archive.org/details/teoriageraldoempregodojuroedamoedajohnmaynardkeynes/mode/2up', // Archive PT
    isFree: true
  },
  {
    title: 'Manifesto do Partido Comunista',
    author: 'Karl Marx e Friedrich Engels',
    description: 'O panfleto político mais lido da história mundial. Resume a teoria da luta de classes e a visão materialista histórica do desenvolvimento da sociedade.',
    link: 'https://www.marxists.org/portugues/marx/1848/ManifestoDoPartidoComunista/', // Marxists PT
    isFree: true
  },
  {
    title: 'Leviatã',
    author: 'Thomas Hobbes',
    description: 'Clássico da teoria do contrato social. Defende a necessidade de um Estado forte e centralizado para evitar a "guerra de todos contra todos".',
    link: 'http://www.dominiopublico.gov.br/download/texto/cv000048.pdf', // Dominio Publico (Resumo/Excertos ou Obra dependendo da versão, mas valid link)
    isFree: true
  },
  {
    title: 'A Lei',
    author: 'Frédéric Bastiat',
    description: 'Um ensaio clássico do liberalismo económico. Bastiat critica o "espolio legal" e defende que a lei deve apenas proteger a vida, a liberdade e a propriedade.',
    link: 'https://archive.org/details/A_Lei-Frederic_Bastiat/mode/2up', // Archive PT
    isFree: true
  }
];

export default async function LibraryBooksPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Language) || 'pt';
  const t = getT(lang);

  return (
    <div className="container max-w-6xl py-8">
      <PageHeader>
        <PageHeaderHeading>{t('library.booksTitle')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('library.booksDescription')}
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {recommendedBooks.map((book) => (
          <Card key={book.title} className="flex flex-col relative border-t-4 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                 {book.isFree && (
                     <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('library.isFreeBadge')}
                     </Badge>
                 )}
              </div>
              <CardTitle className="text-xl">{book.title}</CardTitle>
              <CardDescription className="font-semibold text-primary/80">{book.author}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-0">
              <p className="text-sm text-muted-foreground mt-2">{book.description}</p>
            </CardContent>
            <div className="p-6 pt-4 mt-auto border-t bg-muted/20">
                <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline flex items-center justify-center w-full bg-background border px-4 py-2 rounded-md shadow-sm hover:bg-muted transition-colors">
                    {book.isFree ? t('library.downloadLink') : "Ver na Loja"} <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
