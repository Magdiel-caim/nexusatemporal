import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const PrivacyPage = () => {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-custom max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">Política de Privacidade</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Informações que coletamos</h2>
              <p className="mb-4">
                O Nexus Atemporal coleta informações que você nos fornece diretamente, como:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Nome completo e informações de contato (email, telefone)</li>
                <li>Informações de cadastro e perfil profissional</li>
                <li>Dados de pagamento (processados por gateways seguros)</li>
                <li>Informações sobre uso do sistema e preferências</li>
                <li>Comunicações com nossa equipe de suporte</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Como usamos suas informações</h2>
              <p className="mb-4">Utilizamos as informações coletadas para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Fornecer, operar e melhorar nossos serviços</li>
                <li>Processar transações e enviar notificações relacionadas</li>
                <li>Responder a seus comentários e perguntas</li>
                <li>Enviar informações técnicas, atualizações e avisos</li>
                <li>Personalizar sua experiência no sistema</li>
                <li>Monitorar e analisar tendências de uso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Compartilhamento de informações</h2>
              <p className="mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Com seu consentimento explícito</li>
                <li>Com provedores de serviços que nos auxiliam (ex: processamento de pagamentos)</li>
                <li>Para cumprir obrigações legais</li>
                <li>Para proteger direitos, propriedade e segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Segurança dos dados</h2>
              <p className="mb-4">
                Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações pessoais:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Criptografia SSL/TLS para todas as transmissões de dados</li>
                <li>Criptografia de dados em repouso</li>
                <li>Backup automático diário</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Seus direitos (LGPD)</h2>
              <p className="mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Confirmação da existência de tratamento de dados</li>
                <li>Acesso aos seus dados pessoais</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminação dos dados tratados com seu consentimento</li>
                <li>Revogação do consentimento</li>
              </ul>
              <p className="mt-4">
                Para exercer seus direitos, entre em contato conosco através do email:{' '}
                <a href="mailto:privacidade@nexusatemporal.com.br" className="text-brand-500">
                  privacidade@nexusatemporal.com.br
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p className="mb-4">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Retenção de dados</h2>
              <p className="mb-4">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Alterações nesta política</h2>
              <p className="mb-4">
                Podemos atualizar esta política periodicamente. Notificaremos você sobre quaisquer mudanças significativas através do email cadastrado ou por meio de um aviso em nosso site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Contato</h2>
              <p className="mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacidade@nexusatemporal.com.br" className="text-brand-500">
                    privacidade@nexusatemporal.com.br
                  </a>
                </li>
                <li>
                  <strong>Telefone:</strong> +55 (11) 9999-9999
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
