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
import { Add as AddIcon, Visibility, Edit, Share } from '@mui/icons-material';

export default function LandingPagesTab() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Landing Pages</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nova Landing Page
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            Nenhuma landing page criada
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Crie landing pages profissionais com editor visual drag-and-drop
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Criar Primeira Landing Page
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          🎨 Editor GrapesJS
        </Typography>
        <Typography variant="body2" paragraph>
          Landing Page Builder com editor visual drag-and-drop. Crie páginas profissionais sem
          código.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Drag & Drop" size="small" color="success" />
          <Chip label="Responsive Design" size="small" color="success" />
          <Chip label="SEO Friendly" size="small" color="success" />
          <Chip label="Analytics Integrado" size="small" color="success" />
          <Chip label="Custom Domain" size="small" color="warning" />
          <Chip label="A/B Testing" size="small" color="warning" />
        </Box>
      </Box>
    </Box>
  );
}
