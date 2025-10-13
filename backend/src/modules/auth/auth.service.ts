import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource, CrmDataSource, getTenantDataSource } from '@/database/data-source';
import { User, UserRole, UserStatus } from './user.entity';
import { AppError } from '@/shared/middleware/error-handler';
import { sendEmail } from '@/shared/utils/email';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

export class AuthService {
  private userRepository = CrmDataSource.getRepository(User);

  generateAccessToken(payload: TokenPayload): string {
    const options: any = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, options);
  }

  generateRefreshToken(payload: TokenPayload): string {
    const options: any = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    tenantId?: string;
  }) {
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const user = this.userRepository.create({
      ...data,
      emailVerificationToken: uuidv4(),
      role: data.role || UserRole.USER,
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.sendVerificationEmail(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is not active', 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Update user
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    if (ipAddress) {
      user.lastLoginIp = ipAddress;
    }
    await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({
      where: { id: payload.userId, refreshToken },
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined,
    };

    const accessToken = this.generateAccessToken(newPayload);

    return { accessToken };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // Send password reset email
    await this.sendPasswordResetEmail(user, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async getUsers(tenantId?: string) {
    const where: any = { status: UserStatus.ACTIVE };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const users = await this.userRepository.find({
      where,
      select: ['id', 'email', 'name', 'avatar', 'role'],
      order: { name: 'ASC' },
    });

    return users;
  }

  private async sendVerificationEmail(user: User) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - One Nexus Atemporal',
      html: `
        <h1>Welcome to One Nexus Atemporal!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }

  private async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - One Nexus Atemporal',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}
