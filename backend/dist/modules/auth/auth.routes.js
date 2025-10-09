"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const rate_limiter_1 = require("@/shared/middleware/rate-limiter");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', rate_limiter_1.authRateLimiter, auth_controller_1.register);
router.post('/login', rate_limiter_1.authRateLimiter, auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.get('/verify-email/:token', auth_controller_1.verifyEmail);
router.post('/request-password-reset', rate_limiter_1.authRateLimiter, auth_controller_1.requestPasswordReset);
router.post('/reset-password/:token', rate_limiter_1.authRateLimiter, auth_controller_1.resetPassword);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getMe);
router.get('/users', auth_middleware_1.authenticate, auth_controller_1.getUsers);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map