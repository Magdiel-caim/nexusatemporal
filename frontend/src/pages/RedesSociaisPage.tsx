/**
 * Redes Sociais Page
 * Página para configurar integrações com redes sociais via Meta API (Instagram, Messenger)
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaInstagramConnect } from '@/components/integrations/MetaInstagramConnect';
import { Instagram, MessageCircle, Bot } from 'lucide-react';

const RedesSociaisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Redes Sociais</h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas redes sociais e automatize o atendimento via Meta API
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="messenger" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messenger
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Instagram via Meta API */}
        <TabsContent value="instagram" className="mt-6">
          <MetaInstagramConnect />
        </TabsContent>

        {/* Messenger via Meta API */}
        <TabsContent value="messenger" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>Facebook Messenger via Meta API</CardTitle>
              </div>
              <CardDescription>
                Conecte suas páginas do Facebook para atender via Messenger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-3">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Em breve!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A integração com Messenger usará a mesma API do Instagram.
                    Será implementada em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
};

export default RedesSociaisPage;
