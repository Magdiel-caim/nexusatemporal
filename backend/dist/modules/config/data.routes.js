"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_controller_1 = require("./data.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// /api/data endpoint - returns current server date/time
router.get('/', auth_middleware_1.authenticate, data_controller_1.getData);
exports.default = router;
//# sourceMappingURL=data.routes.js.map