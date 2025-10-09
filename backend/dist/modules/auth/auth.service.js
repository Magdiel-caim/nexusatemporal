"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const data_source_1 = require("@/database/data-source");
const user_entity_1 = require("./user.entity");
const error_handler_1 = require("@/shared/middleware/error-handler");
const email_1 = require("@/shared/utils/email");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            throw new error_handler_1.AppError('Invalid or expired token', 401);
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new error_handler_1.AppError('Invalid or expired refresh token', 401);
        }
    }
    async register(data) {
        const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw new error_handler_1.AppError('User already exists', 400);
        }
        const user = this.userRepository.create({
            ...data,
            emailVerificationToken: (0, uuid_1.v4)(),
            role: data.role || user_entity_1.UserRole.USER,
        });
        await this.userRepository.save(user);
        // Send verification email
        await this.sendVerificationEmail(user);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async login(email, password, ipAddress) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new error_handler_1.AppError('Invalid credentials', 401);
        }
        if (user.status !== user_entity_1.UserStatus.ACTIVE) {
            throw new error_handler_1.AppError('Account is not active', 403);
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new error_handler_1.AppError('Invalid credentials', 401);
        }
        const payload = {
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
    async refreshAccessToken(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findOne({
            where: { id: payload.userId, refreshToken },
        });
        if (!user) {
            throw new error_handler_1.AppError('Invalid refresh token', 401);
        }
        const newPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
        };
        const accessToken = this.generateAccessToken(newPayload);
        return { accessToken };
    }
    async verifyEmail(token) {
        const user = await this.userRepository.findOne({
            where: { emailVerificationToken: token },
        });
        if (!user) {
            throw new error_handler_1.AppError('Invalid verification token', 400);
        }
        user.emailVerified = true;
        user.emailVerificationToken = null;
        await this.userRepository.save(user);
        return { message: 'Email verified successfully' };
    }
    async requestPasswordReset(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a reset link has been sent' };
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
        await this.userRepository.save(user);
        // Send password reset email
        await this.sendPasswordResetEmail(user, resetToken);
        return { message: 'If the email exists, a reset link has been sent' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { passwordResetToken: token },
        });
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new error_handler_1.AppError('Invalid or expired reset token', 400);
        }
        user.password = newPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.userRepository.save(user);
        return { message: 'Password reset successfully' };
    }
    async logout(userId) {
        await this.userRepository.update(userId, { refreshToken: null });
        return { message: 'Logged out successfully' };
    }
    async getUsers(tenantId) {
        const where = { status: user_entity_1.UserStatus.ACTIVE };
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
    async sendVerificationEmail(user) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`;
        await (0, email_1.sendEmail)({
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
    async sendPasswordResetEmail(user, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await (0, email_1.sendEmail)({
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map