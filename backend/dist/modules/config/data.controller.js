"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const error_handler_1 = require("@/shared/middleware/error-handler");
exports.getData = (0, error_handler_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    res.json({
        success: true,
        data: {
            timestamp: now.toISOString(),
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            unix: Math.floor(now.getTime() / 1000),
        },
    });
});
//# sourceMappingURL=data.controller.js.map