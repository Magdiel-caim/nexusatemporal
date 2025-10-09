"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments,
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Email sent: ${info.messageId}`);
    }
    catch (error) {
        logger_1.logger.error('Error sending email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
// Verify transporter configuration
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        logger_1.logger.info('Email transporter is ready');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Email transporter verification failed:', error);
        return false;
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
//# sourceMappingURL=email.js.map