"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create logs directory if it doesn't exist
const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
const transports = [
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
];
// Add file transports if enabled
if (process.env.ENABLE_FILE_LOGGING === 'true') {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'combined.log'),
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: logLevel,
    format: logFormat,
    transports,
    exitOnError: false,
});
// Stream for Morgan HTTP logging
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
//# sourceMappingURL=logger.js.map