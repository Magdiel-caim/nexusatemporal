import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Web as WebIcon,
  SmartToy as AIIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Import tab components (will create these next)
import CampaignsTab from '../components/marketing/CampaignsTab';
import SocialPostsTab from '../components/marketing/SocialPostsTab';
import BulkMessagingTab from '../components/marketing/BulkMessagingTab';
import LandingPagesTab from '../components/marketing/LandingPagesTab';
import AIAssistantTab from '../components/marketing/AIAssistantTab';
import AnalyticsTab from '../components/marketing/AnalyticsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`marketing-tabpanel-${index}`}
      aria-labelledby={`marketing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MarketingPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Marketing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie campanhas, posts sociais, envios em massa, landing pages e use IA para otimizar seu marketing
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CampaignIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Campanhas</Typography>
              </Box>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShareIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Posts</Typography>
              </Box>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Mensagens</Typography>
              </Box>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Enviadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">ROI</Typography>
              </Box>
              <Typography variant="h4">0%</Typography>
              <Typography variant="body2" color="text.secondary">
                Retorno sobre investimento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Marketing tabs"
        >
          <Tab icon={<CampaignIcon />} label="Campanhas" />
          <Tab icon={<ShareIcon />} label="Posts Sociais" />
          <Tab icon={<EmailIcon />} label="Mensagens em Massa" />
          <Tab icon={<WebIcon />} label="Landing Pages" />
          <Tab icon={<AIIcon />} label="IA Assistente" />
          <Tab icon={<TrendingUpIcon />} label="Analytics" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <CampaignsTab />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <SocialPostsTab />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <BulkMessagingTab />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <LandingPagesTab />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <AIAssistantTab />
        </TabPanel>

        <TabPanel value={currentTab} index={5}>
          <AnalyticsTab />
        </TabPanel>
      </Paper>

      {/* Info Banner */}
      <Paper sx={{ mt: 3, p: 3, backgroundColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Módulo de Marketing - v116
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Status:</strong> Estrutura base implementada
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Disponível:</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label="Campanhas CRUD" color="success" size="small" />
          <Chip label="Posts Sociais CRUD" color="success" size="small" />
          <Chip label="Mensagens em Massa CRUD" color="success" size="small" />
          <Chip label="Landing Pages CRUD" color="success" size="small" />
          <Chip label="IA Assistant API" color="success" size="small" />
        </Box>
        <Typography variant="body2" paragraph>
          <strong>Próximas Sessões:</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Integrações Facebook/Instagram" color="warning" size="small" />
          <Chip label="Integrações Google Ads/Analytics" color="warning" size="small" />
          <Chip label="Integrações TikTok/LinkedIn" color="warning" size="small" />
          <Chip label="WhatsApp Bulk API" color="warning" size="small" />
          <Chip label="Email Bulk (SendGrid)" color="warning" size="small" />
          <Chip label="GrapesJS Landing Page Builder" color="warning" size="small" />
          <Chip label="Múltiplos Modelos IA" color="warning" size="small" />
        </Box>
      </Paper>
    </Container>
  );
}
