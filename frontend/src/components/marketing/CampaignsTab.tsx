import React from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function CampaignsTab() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Campanhas de Marketing</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nova Campanha
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Orçamento</TableCell>
              <TableCell>Gasto</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Nenhuma campanha criada ainda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clique em "Nova Campanha" para começar
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Dica: Tipos de Campanha Disponíveis
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip label="Social Media" size="small" />
          <Chip label="Email Marketing" size="small" />
          <Chip label="WhatsApp" size="small" />
          <Chip label="Landing Pages" size="small" />
          <Chip label="Multi-Canal" size="small" />
        </Box>
      </Box>
    </Box>
  );
}
