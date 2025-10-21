/**
 * Integrações Sociais Page
 * Página para configurar integrações com redes sociais (Instagram, Messenger)
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import NotificaMeConfig from '@/components/integrations/NotificaMeConfig';
import { Instagram, MessageCircle, Bot, ExternalLink } from 'lucide-react';

const IntegracoesSociaisPage: React.FC = () => {
  /**
   * Abre painel NotificaMe para conectar Instagram
   */
  const handleConnectInstagram = () => {
    window.open('https://app.notificame.com.br/dashboard', '_blank');
  };

  /**
   * Abre painel NotificaMe para conectar Messenger
   */
  const handleConnectMessenger = () => {
    window.open('https://app.notificame.com.br/dashboard', '_blank');
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrações Sociais</h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas redes sociais e automatize o atendimento
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notificame" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notificame" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Instagram & Messenger
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chatbot IA
          </TabsTrigger>
        </TabsList>

        {/* Instagram & Messenger */}
        <TabsContent value="notificame" className="mt-6">
          <NotificaMeConfig />
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business</CardTitle>
              <CardDescription>
                Configure sua integração com WhatsApp para atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acesse o módulo de{' '}
                <a href="/chat" className="text-primary hover:underline">
                  Chat
                </a>{' '}
                para configurar sua conexão WhatsApp.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chatbot IA */}
        <TabsContent value="chatbot" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot com Inteligência Artificial</CardTitle>
              <CardDescription>
                Configure respostas automáticas inteligentes usando IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O chatbot com IA será implementado em breve. Ele poderá:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Responder perguntas frequentes automaticamente</li>
                  <li>Qualificar leads antes de passar para atendente</li>
                  <li>Agendar consultas via conversa</li>
                  <li>Enviar informações sobre procedimentos</li>
                  <li>Integrar com WhatsApp, Instagram e Messenger</li>
                </ul>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 Enquanto isso, você pode usar a integração com OpenAI no módulo de{' '}
                    <a href="/automacao" className="text-primary hover:underline">
                      Automação
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleConnectInstagram}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <CardTitle className="text-base">Instagram Direct</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Receba e responda mensagens do Instagram diretamente no sistema
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
              e.stopPropagation();
              handleConnectInstagram();
            }}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar Instagram
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleConnectMessenger}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Facebook Messenger</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Centralize conversas do Messenger em um só lugar
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
              e.stopPropagation();
              handleConnectMessenger();
            }}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Conectar Messenger
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base">Automação</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure respostas automáticas e workflows inteligentes
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/automation">
                Ver Automações
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegracoesSociaisPage;
