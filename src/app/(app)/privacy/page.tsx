import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
            O <strong>Demokratia Portugal</strong> ("nós", "nosso") valoriza a sua privacidade. Esta política descreve como recolhemos, utilizamos e protegemos os seus dados pessoais e como utilizamos cookies na nossa plataforma.
          </p>
          <p>
            Ao utilizar o Demokratia, concorda com as práticas descritas nesta política. Estamos empenhados em cumprir o Regulamento Geral sobre a Proteção de Dados (RGPD).
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
            <li><strong>Identificação:</strong> Nome de apresentação e endereço de e-mail.</li>
            <li><strong>Perfil:</strong> Foto de perfil (URL fornecido pela Google).</li>
            <li><strong>Conteúdo do Utilizador:</strong> Simulações guardadas, propostas submetidas, visualizações de dados personalizadas e histórico de fact-checking.</li>
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
            <li>Guardar e gerir o seu histórico de simulações e análises.</li>
            <li>Permitir a submissão e votação em propostas comunitárias.</li>
            <li>Enviar notificações e newsletters, caso tenha dado o seu consentimento explícito no seu perfil.</li>
            <li>Melhorar a experiência de utilização através de análises anónimas.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Cookies e Tecnologias de Terceiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Utilizamos cookies para melhorar a sua experiência:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookies Essenciais:</strong> Necessários para a autenticação do utilizador via Firebase Auth.</li>
            <li><strong>Cookies de Publicidade:</strong> Utilizamos o Google AdSense para exibir anúncios. A Google utiliza cookies para apresentar anúncios com base nas suas visitas anteriores a este ou a outros sites.</li>
            <li><strong>Cookies de Preferências:</strong> Para memorizar definições como o estado da barra lateral ou o modo escuro.</li>
          </ul>
          <p>Pode gerir ou desativar os cookies nas definições do seu navegador.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Partilha de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Não vendemos os seus dados a terceiros. Os dados são armazenados de forma segura nos servidores da Google Cloud/Firebase. O conteúdo que decidir partilhar publicamente (como Propostas ou Simulações Partilhadas) será visível por outros utilizadores, acompanhado pelo seu nome e foto de perfil.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Os Seus Direitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Nos termos do RGPD, tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Aceder aos dados que temos sobre si.</li>
            <li>Solicitar a retificação de dados incorretos.</li>
            <li>Solicitar o apagamento total da sua conta e dados ("Direito ao esquecimento").</li>
            <li>Retirar o consentimento para comunicações a qualquer momento.</li>
          </ul>
          <p>Pode exercer estes direitos enviando uma mensagem através da nossa página de Contacto.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Se tiver dúvidas sobre esta política, pode contactar-nos através do formulário de contacto na aplicação ou diretamente para o e-mail do administrador indicado na secção de contactos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
