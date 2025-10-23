import { Router } from 'express';
import { getData } from './data.controller';
import { CepController } from './cep.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';

const router = Router();
const cepController = new CepController();

// /api/data endpoint - returns current server date/time
router.get('/', authenticate, getData);

// /api/data/cep/:cep endpoint - busca informações de endereço pelo CEP
router.get('/cep/:cep', authenticate, (req, res) => cepController.getCep(req, res));

export default router;
