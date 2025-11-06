import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const TermsPage = () => {
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

          <h1 className="text-4xl md:text-5xl font-bold mb-6">Termos de Uso</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p className="mb-4">
                Ao acessar e usar o Nexus Atemporal, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não use nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
              <p className="mb-4">
                O Nexus Atemporal é uma plataforma SaaS (Software as a Service) que oferece ferramentas de gestão para clínicas e consultórios, incluindo:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Gestão de pacientes e prontuários eletrônicos</li>
                <li>Agendamento e calendário</li>
                <li>Gestão financeira e estoque</li>
                <li>Comunicação multi-canal (WhatsApp, email, etc.)</li>
                <li>Automações e integrações</li>
                <li>Business Intelligence e relatórios</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Registro e Conta</h2>
              <p className="mb-4">Para usar o serviço, você deve:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Fornecer informações precisas e completas no registro</li>
                <li>Manter a segurança de sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
                <li>Ter pelo menos 18 anos ou capacidade legal para contratar</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Planos e Pagamento</h2>
              <p className="mb-4">
                <strong>4.1 Trial Gratuito:</strong> Oferecemos 10 dias de teste gratuito sem necessidade de cartão de crédito.
              </p>
              <p className="mb-4">
                <strong>4.2 Planos Pagos:</strong> Após o período de trial, você pode escolher um plano pago. Os preços estão disponíveis em nossa página de preços.
              </p>
              <p className="mb-4">
                <strong>4.3 Faturamento:</strong> Cobramos mensalmente ou anualmente, conforme o plano escolhido. Todas as cobranças são processadas através de gateways de pagamento seguros.
              </p>
              <p className="mb-4">
                <strong>4.4 Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. O cancelamento terá efeito no final do período de faturamento atual.
              </p>
              <p className="mb-4">
                <strong>4.5 Reembolso:</strong> Oferecemos garantia de 30 dias. Se não estiver satisfeito, reembolsaremos 100% do valor pago.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Uso Aceitável</h2>
              <p className="mb-4">Você concorda em NÃO:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violar qualquer lei ou regulamento</li>
                <li>Infringir direitos de propriedade intelectual</li>
                <li>Transmitir vírus ou código malicioso</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Usar o serviço para spam ou phishing</li>
                <li>Fazer engenharia reversa do software</li>
                <li>Revender ou redistribuir o serviço</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Propriedade Intelectual</h2>
              <p className="mb-4">
                Todo o conteúdo, recursos e funcionalidades do Nexus Atemporal são propriedade da empresa e protegidos por leis de propriedade intelectual. Você recebe uma licença limitada, não exclusiva e não transferível para usar o serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Dados do Usuário</h2>
              <p className="mb-4">
                <strong>7.1 Propriedade:</strong> Você mantém todos os direitos sobre os dados que insere no sistema.
              </p>
              <p className="mb-4">
                <strong>7.2 Backup:</strong> Realizamos backup diário automático, mas recomendamos que você também mantenha cópias de segurança.
              </p>
              <p className="mb-4">
                <strong>7.3 Exclusão:</strong> Ao cancelar sua conta, seus dados serão retidos por 30 dias e depois permanentemente excluídos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Disponibilidade do Serviço</h2>
              <p className="mb-4">
                Nos esforçamos para manter o serviço disponível 99,9% do tempo, mas não garantimos operação ininterrupta. Podemos realizar manutenções programadas com aviso prévio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Limitação de Responsabilidade</h2>
              <p className="mb-4">
                O serviço é fornecido "como está". Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Perda de dados ou lucros</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Interrupções de serviço</li>
                <li>Ações de terceiros</li>
              </ul>
              <p className="mt-4">
                Nossa responsabilidade total está limitada ao valor pago nos últimos 12 meses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Modificações</h2>
              <p className="mb-4">
                Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos sobre mudanças significativas por email ou através do sistema. O uso continuado após as mudanças constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Rescisão</h2>
              <p className="mb-4">
                Podemos suspender ou encerrar sua conta se você violar estes termos. Você pode encerrar sua conta a qualquer momento através das configurações ou entrando em contato conosco.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Lei Aplicável</h2>
              <p className="mb-4">
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais de São Paulo, SP.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Contato</h2>
              <p className="mb-4">
                Para questões sobre estes Termos de Uso, entre em contato:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@nexusatemporal.com.br" className="text-brand-500">
                    legal@nexusatemporal.com.br
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
