import { Request, Response } from 'express';
import { asyncHandler } from '@/shared/middleware/error-handler';

export const getData = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();

  res.json({
    success: true,
    data: {
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      unix: Math.floor(now.getTime() / 1000),
    },
  });
});
