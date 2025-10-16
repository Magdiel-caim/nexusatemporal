"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("./error-handler");
const user_entity_1 = require("../../modules/auth/user.entity");
const data_source_1 = require("../../database/data-source");
const user_entity_2 = require("../../modules/auth/user.entity");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_handler_1.AppError('No token provided', 401);
        }
        const token = authHeader.substring(7);
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Optionally verify user still exists and is active
        const userRepository = data_source_1.AppDataSource.getRepository(user_entity_2.User);
        const user = await userRepository.findOne({
            where: { id: payload.userId },
            select: ['id', 'email', 'name', 'role', 'status', 'tenantId', 'permissions'],
        });
        if (!user) {
            throw new error_handler_1.AppError('User not found', 401);
        }
        if (user.status !== 'active') {
            throw new error_handler_1.AppError('User account is not active', 403);
        }
        // Attach user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            permissions: user.permissions || [],
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_handler_1.AppError('Invalid token', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new error_handler_1.AppError('User not authenticated', 401));
        }
        if (!roles.includes(user.role)) {
            return next(new error_handler_1.AppError('You do not have permission to access this resource', 403));
        }
        next();
    };
};
exports.authorize = authorize;
const checkPermission = (permission) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new error_handler_1.AppError('User not authenticated', 401));
        }
        // Super admin has all permissions
        if (user.role === user_entity_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        if (!user.permissions || !user.permissions.includes(permission)) {
            return next(new error_handler_1.AppError('You do not have the required permission', 403));
        }
        next();
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=auth.middleware.js.map