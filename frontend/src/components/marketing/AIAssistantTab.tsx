import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { SmartToy, Image as ImageIcon, Analytics, Lightbulb } from '@mui/icons-material';

export default function AIAssistantTab() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        IA Assistente de Marketing
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use inteligência artificial para otimizar suas campanhas e criar conteúdo
      </Typography>

      <Grid container spacing={3}>
        {/* AI Providers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Modelos de IA Disponíveis
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip label="Groq (300+ tokens/s)" color="primary" />
                <Chip label="OpenRouter (400+ modelos)" color="success" />
                <Chip label="DeepSeek (baixo custo)" color="info" />
                <Chip label="Mistral (Agents API)" color="warning" />
                <Chip label="Qwen (Alibaba)" color="secondary" />
                <Chip label="Ollama (self-hosted)" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Use Cases */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lightbulb color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Otimização de Cópias</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Analise e otimize textos de anúncios, posts e emails
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Cole seu texto aqui para otimização..."
                size="small"
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" fullWidth>
                Otimizar com IA
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Geração de Imagens</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Crie imagens únicas com IA para suas campanhas
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Descreva a imagem que deseja gerar..."
                size="small"
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" fullWidth>
                Gerar Imagem
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Analytics color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Análise de Campanhas</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Obtenha insights e sugestões de melhoria
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Selecione uma campanha</InputLabel>
                <Select label="Selecione uma campanha">
                  <MenuItem value="">Nenhuma campanha disponível</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" fullWidth disabled>
                Analisar Campanha
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToy color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Previsão de Performance</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Preveja engajamento e conversões antes de publicar
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Selecione um post</InputLabel>
                <Select label="Selecione um post">
                  <MenuItem value="">Nenhum post disponível</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" fullWidth disabled>
                Prever Performance
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          🤖 Configuração Necessária
        </Typography>
        <Typography variant="body2" paragraph>
          Para usar os modelos de IA, configure as API Keys nas variáveis de ambiente:
        </Typography>
        <Box component="code" sx={{ display: 'block', p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1, fontSize: '0.85rem' }}>
          GROQ_API_KEY=your_key_here<br />
          OPENROUTER_API_KEY=your_key_here<br />
          DEEPSEEK_API_KEY=your_key_here<br />
          MISTRAL_API_KEY=your_key_here<br />
          QWEN_API_KEY=your_key_here
        </Box>
      </Box>
    </Box>
  );
}
