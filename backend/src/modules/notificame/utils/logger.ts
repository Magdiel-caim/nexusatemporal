import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../../../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Formato customizado
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }

        return msg;
    })
);

// Configuração do logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    defaultMeta: {
        service: 'notificame-integration',
        version: '1.0.0'
    },
    transports: [
        // Erros
        new winston.transports.File({
            filename: path.join(logDir, 'notificame-error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Warnings
        new winston.transports.File({
            filename: path.join(logDir, 'notificame-warn.log'),
            level: 'warn',
            maxsize: 5242880,
            maxFiles: 3
        }),

        // Todos os logs
        new winston.transports.File({
            filename: path.join(logDir, 'notificame-combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 7
        })
    ],

    // Tratamento de exceções não capturadas
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'notificame-exceptions.log')
        })
    ],

    // Tratamento de promises rejeitadas
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'notificame-rejections.log')
        })
    ]
});

// Em desenvolvimento, logar também no console com cores
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                let msg = `${timestamp} ${level}: ${message}`;

                if (Object.keys(meta).length > 0 && meta.service !== 'notificame-integration') {
                    msg += `\n${JSON.stringify(meta, null, 2)}`;
                }

                return msg;
            })
        )
    }));
}

export default logger;
