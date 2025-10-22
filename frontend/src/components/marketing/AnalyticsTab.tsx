import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

export default function AnalyticsTab() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Analytics e Métricas
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Acompanhe o desempenho de suas campanhas em tempo real
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Impressões Totais
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">0</Typography>
                <TrendingFlat color="disabled" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Últimos 30 dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Taxa de Cliques (CTR)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">0%</Typography>
                <TrendingFlat color="disabled" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Últimos 30 dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Conversões
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">0</Typography>
                <TrendingFlat color="disabled" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Últimos 30 dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" gutterBottom>
                Conecte suas integrações para ver métricas
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure as integrações com Facebook Ads, Google Ads, Google Analytics e TikTok para visualizar dados em tempo real
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
                <Chip label="Facebook Ads" />
                <Chip label="Google Ads" />
                <Chip label="Google Analytics" />
                <Chip label="TikTok Ads" />
                <Chip label="LinkedIn Ads" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          📊 Integrações Planejadas
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Facebook Marketing API:</strong> Insights de campanhas, métricas de performance, conversions API
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Google Ads API:</strong> Performance de campanhas, keywords analytics, budget tracking
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Google Analytics 4 API:</strong> Relatórios customizados, métricas de conversão
        </Typography>
        <Typography variant="body2">
          <strong>TikTok Marketing API:</strong> Campaign management, ad performance metrics
        </Typography>
      </Box>
    </Box>
  );
}
