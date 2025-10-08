import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '@/shared/middleware/error-handler';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  const result = await authService.login(email, password, ipAddress);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: result,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await authService.verifyEmail(token);

  res.json({
    success: true,
    message: result.message,
  });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.requestPasswordReset(email);

  res.json({
    success: true,
    message: result.message,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.json({
    success: true,
    message: result.message,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  const result = await authService.logout(userId);

  res.json({
    success: true,
    message: result.message,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  res.json({
    success: true,
    data: user,
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = (req as any).user?.tenantId;

  const users = await authService.getUsers(tenantId);

  res.json({
    success: true,
    data: users,
  });
});
