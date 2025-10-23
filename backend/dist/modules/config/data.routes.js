"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_controller_1 = require("./data.controller");
const cep_controller_1 = require("./cep.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const cepController = new cep_controller_1.CepController();
// /api/data endpoint - returns current server date/time
router.get('/', auth_middleware_1.authenticate, data_controller_1.getData);
// /api/data/cep/:cep endpoint - busca informações de endereço pelo CEP
router.get('/cep/:cep', auth_middleware_1.authenticate, (req, res) => cepController.getCep(req, res));
exports.default = router;
//# sourceMappingURL=data.routes.js.map