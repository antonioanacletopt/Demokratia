import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Termos de Utilização</h1>
        <p className="text-muted-foreground mt-2 text-lg">Última atualização: 24 de Maio de 2024</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Aceitação dos Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Ao aceder e utilizar o <strong>Demokratia Portugal</strong>, aceita ficar vinculado aos presentes Termos de Utilização. Se não concordar com alguma parte destes termos, não deverá utilizar a plataforma.
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-400">2. Isenção de Responsabilidade (IA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            O Demokratia utiliza modelos de Inteligência Artificial (IA) para gerar simulações, fact-checks e consultas legislativas. 
            <strong> É fundamental compreender que:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>As respostas geradas podem conter imprecisões ou "alucinações" (informações incorretas geradas pela IA).</li>
            <li>O conteúdo gerado tem fins meramente informativos e educativos e <strong>não constitui aconselhamento jurídico, financeiro ou económico oficial</strong>.</li>
            <li>Deve sempre verificar as fontes oficiais citadas antes de tomar qualquer decisão baseada na informação fornecida pela plataforma.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Utilização da Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>O utilizador compromete-se a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizar a plataforma de forma lícita e ética.</li>
            <li>Não submeter propostas que contenham discurso de ódio, violência ou conteúdo discriminatório.</li>
            <li>Reconhecer que as propostas submetidas publicamente são da sua inteira responsabilidade.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Propriedade Intelectual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            A estrutura, design e algoritmos do Demokratia são propriedade da plataforma. Os dados públicos apresentados pertencem às respetivas fontes oficiais citadas (INE, Pordata, etc.). O conteúdo gerado por IA está sob uma licença de uso livre para fins cívicos e não comerciais.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Modificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. A utilização continuada da plataforma após tais alterações constitui aceitação dos novos termos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
