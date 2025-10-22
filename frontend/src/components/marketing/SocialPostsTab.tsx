import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Facebook, Instagram, LinkedIn } from '@mui/icons-material';

export default function SocialPostsTab() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Posts de Redes Sociais</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Novo Post
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Instagram color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Instagram</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Posts publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Facebook color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Facebook</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Posts publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinkedIn color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">LinkedIn</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Posts publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">TikTok</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Posts publicados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            Nenhum post agendado ou publicado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Crie posts para Instagram, Facebook, LinkedIn e TikTok
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Criar Primeiro Post
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          ⚡ Recursos Disponíveis
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip label="Agendamento de Posts" size="small" color="success" />
          <Chip label="Preview de Posts" size="small" color="success" />
          <Chip label="Multi-plataforma" size="small" color="success" />
          <Chip label="Métricas de Engajamento" size="small" color="warning" />
          <Chip label="API Instagram" size="small" color="warning" />
          <Chip label="API Facebook" size="small" color="warning" />
        </Box>
      </Box>
    </Box>
  );
}
