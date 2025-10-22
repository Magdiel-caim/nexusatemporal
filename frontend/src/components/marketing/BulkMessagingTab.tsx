import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Add as AddIcon, WhatsApp, Email as EmailIcon } from '@mui/icons-material';

export default function BulkMessagingTab() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Envios em Massa</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Novo Envio
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WhatsApp sx={{ mr: 1, color: '#25D366' }} />
                <Typography variant="subtitle1">WhatsApp</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Mensagens enviadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Email</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Emails enviados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Instagram DM
              </Typography>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Mensagens enviadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            Nenhum envio em massa configurado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure envios em massa para WhatsApp, Email e Instagram DM
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Criar Primeiro Envio
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          ⚠️ Importante: Limites e Custos
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>WhatsApp:</strong> 1,000 - 100,000 msgs/dia (depende do tier). Requer opt-in.
          Custo por mensagem.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Email:</strong> Ilimitado (com custo). Tracking de abertura e cliques incluído.
        </Typography>
        <Typography variant="body2">
          <strong>Instagram DM:</strong> Rate limits aplicam. Usuário deve ter interagido antes.
        </Typography>
      </Box>
    </Box>
  );
}
