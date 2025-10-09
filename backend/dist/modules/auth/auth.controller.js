"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getMe = exports.logout = exports.resetPassword = exports.requestPasswordReset = exports.verifyEmail = exports.refreshToken = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const error_handler_1 = require("@/shared/middleware/error-handler");
const authService = new auth_service_1.AuthService();
exports.register = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: user,
    });
});
exports.login = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const result = await authService.login(email, password, ipAddress);
    res.json({
        success: true,
        message: 'Login successful',
        data: result,
    });
});
exports.refreshToken = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({
        success: true,
        data: result,
    });
});
exports.verifyEmail = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    res.json({
        success: true,
        message: result.message,
    });
});
exports.requestPasswordReset = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json({
        success: true,
        message: result.message,
    });
});
exports.resetPassword = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json({
        success: true,
        message: result.message,
    });
});
exports.logout = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await authService.logout(userId);
    res.json({
        success: true,
        message: result.message,
    });
});
exports.getMe = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        data: user,
    });
});
exports.getUsers = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const tenantId = req.user?.tenantId;
    const users = await authService.getUsers(tenantId);
    res.json({
        success: true,
        data: users,
    });
});
//# sourceMappingURL=auth.controller.js.map