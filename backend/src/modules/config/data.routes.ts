import { Router } from 'express';
import { getData } from './data.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';

const router = Router();

// /api/data endpoint - returns current server date/time
router.get('/', authenticate, getData);

export default router;
