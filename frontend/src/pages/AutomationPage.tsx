/**
 * Automation Page - Sistema de Automações
 *
 * Página principal com tabs para Integrações, Triggers e Eventos
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationsTab from '@/components/automation/IntegrationsTab';
import TriggersTab from '@/components/automation/TriggersTab';
import EventsTab from '@/components/automation/EventsTab';
import DashboardTab from '@/components/automation/DashboardTab';
import { Bot, Zap, Activity, Settings } from 'lucide-react';

const AutomationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Automações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie integrações, triggers e monitore eventos do sistema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Eventos
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsTab />
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <TriggersTab />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <EventsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationPage;
