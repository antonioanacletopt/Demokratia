import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Política de Privacidade e Cookies</h1>
        <p className="text-muted-foreground mt-2 text-lg">Última atualização: 24 de Maio de 2024</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Introdução</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            O <strong>Demokratia Portugal</strong> ("nós", "nosso") valoriza a sua privacidade. Esta política descreve como recolhemos, utilizamos e protegemos os seus dados pessoais e como utilizamos cookies na nossa plataforma, em estrita conformidade com o <strong>RGPD</strong>.
          </p>
          <p>
            Ao utilizar o Demokratia, concorda com as práticas descritas nesta política. Estamos empenhados em garantir a transparência total sobre o destino dos seus dados.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Dados que Recolhemos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Para o funcionamento da plataforma, recolhemos os seguintes dados através da sua autenticação com a conta Google:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identificação:</strong> Nome de apresentação, endereço de e-mail e foto de perfil (URL).</li>
            <li><strong>Conteúdo do Utilizador:</strong> Simulações guardadas, propostas submetidas, visualizações de dados personalizadas e histórico de fact-checking.</li>
            <li><strong>Dados de Utilização:</strong> Endereço IP e cookies técnicos necessários para a segurança da sessão.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Finalidade do Tratamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Os seus dados são utilizados exclusivamente para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Permitir o acesso seguro e personalizado à plataforma.</li>
            <li>Guardar e gerir o seu histórico privado de simulações e análises.</li>
            <li>Permitir a submissão e votação em propostas comunitárias (exibindo o seu nome e foto aos outros utilizadores).</li>
            <li>Garantir a integridade da plataforma através da prevenção de abusos.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Cookies e Publicidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Utilizamos cookies para melhorar a sua experiência:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookies Essenciais:</strong> Necessários para manter a sua sessão iniciada (Firebase Auth).</li>
            <li><strong>Google AdSense:</strong> Utilizamos o AdSense para exibir anúncios que ajudam a manter a plataforma gratuita. A Google pode utilizar cookies para personalizar anúncios com base nos seus interesses. Pode gerir estas definições no seu navegador.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>5. Os Seus Direitos (RGPD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Nos termos do RGPD, o utilizador tem os seguintes direitos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Direito de Acesso:</strong> Pode ver todos os seus dados guardados na sua página de perfil.</li>
            <li><strong>Direito de Retificação:</strong> Pode alterar o seu nome de apresentação a qualquer momento no perfil.</li>
            <li><strong>Direito ao Esquecimento (Eliminação):</strong> Disponibilizamos uma ferramenta de eliminação total de conta na página de <Link href="/profile" className="text-primary hover:underline font-medium">Perfil</Link>, que apaga todos os seus registos de forma imediata e definitiva.</li>
            <li><strong>Direito à Portabilidade:</strong> Caso pretenda uma exportação dos seus dados, pode contactar-nos.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Para exercer qualquer direito ou esclarecer dúvidas, utilize o nosso <Link href="/contact" className="text-primary hover:underline font-medium">formulário de contacto</Link>. O encarregado de proteção de dados analisará o seu pedido num prazo máximo de 30 dias.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
