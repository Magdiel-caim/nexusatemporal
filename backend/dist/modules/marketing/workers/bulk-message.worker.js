"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkMessageQueue = void 0;
const bullmq_1 = require("bullmq");
const data_source_1 = require("../../../database/data-source");
const bulk_message_contact_entity_1 = require("../entities/bulk-message-contact.entity");
const waha_service_1 = require("../services/waha.service");
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
};
exports.bulkMessageQueue = new bullmq_1.Queue('bulk-messages', { connection });
const worker = new bullmq_1.Worker('bulk-messages', async (job) => {
    const { bulkMessageId, sessionId, tenantId, message, imageUrl, contacts, minDelay, maxDelay } = job.data;
    console.log(`[BulkWorker] Processing bulk message ${bulkMessageId} with ${contacts.length} contacts`);
    const wahaService = new waha_service_1.WahaService();
    const contactRepo = data_source_1.AppDataSource.getRepository(bulk_message_contact_entity_1.BulkMessageContact);
    for (const contact of contacts) {
        try {
            // Delay aleatório
            const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
            console.log(`[BulkWorker] Waiting ${randomDelay.toFixed(1)}s before sending to ${contact.name}`);
            await new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
            // Personalizar mensagem (substituir {nome})
            const personalizedMessage = message.replace(/{nome}/g, contact.name);
            // Enviar mensagem
            await wahaService.sendMessage(sessionId, tenantId, {
                phoneNumber: contact.phone,
                message: personalizedMessage,
                mediaUrl: imageUrl || undefined,
            });
            // Atualizar status
            await contactRepo.update({ bulkMessageId, phoneNumber: contact.phone }, {
                status: 'sent',
                personalizedContent: personalizedMessage,
                sentAt: new Date(),
            });
            console.log(`[BulkWorker] ✓ Sent to ${contact.name} (${contact.phone})`);
        }
        catch (error) {
            console.error(`[BulkWorker] ✗ Failed to send to ${contact.name}:`, error.message);
            await contactRepo.update({ bulkMessageId, phoneNumber: contact.phone }, {
                status: 'failed',
                errorMessage: error.message,
                failedAt: new Date(),
            });
        }
        // Update job progress
        const currentIndex = contacts.indexOf(contact) + 1;
        await job.updateProgress((currentIndex / contacts.length) * 100);
    }
    console.log(`[BulkWorker] ✓ Completed bulk message ${bulkMessageId}`);
}, { connection });
worker.on('completed', (job) => {
    console.log(`[BulkWorker] Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.error(`[BulkWorker] Job ${job?.id} failed:`, err);
});
exports.default = worker;
//# sourceMappingURL=bulk-message.worker.js.map