"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendas_controller_1 = require("./vendas.controller");
const database_1 = require("./database");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// All vendas routes require authentication
router.use(auth_middleware_1.authenticate);
// Initialize controller (lazy initialization)
let vendasController;
const initController = () => {
    if (!vendasController) {
        const db = (0, database_1.getVendasDbPool)();
        vendasController = new vendas_controller_1.VendasController(db);
    }
};
// ============================================
// ROTAS DE VENDEDORES
// ============================================
// CRUD de Vendedores
router.post('/vendedores', (req, res) => {
    initController();
    vendasController.createVendedor(req, res);
});
router.get('/vendedores', (req, res) => {
    initController();
    vendasController.listVendedores(req, res);
});
router.get('/vendedores/:id/vendas', (req, res) => {
    initController();
    vendasController.getVendasByVendedor(req, res);
});
router.get('/vendedores/:id', (req, res) => {
    initController();
    vendasController.getVendedor(req, res);
});
router.put('/vendedores/:id', (req, res) => {
    initController();
    vendasController.updateVendedor(req, res);
});
router.delete('/vendedores/:id', (req, res) => {
    initController();
    vendasController.deleteVendedor(req, res);
});
// ============================================
// ROTAS DE COMISSÕES
// ============================================
// IMPORTANTE: Rotas de comissões DEVEM vir ANTES das rotas de vendas
// para evitar que /comissoes seja interpretado como /:id
// Estatísticas e relatórios ANTES de rotas dinâmicas
router.get('/comissoes/stats', (req, res) => {
    initController();
    vendasController.getComissoesStats(req, res);
});
router.get('/comissoes/relatorio', (req, res) => {
    initController();
    vendasController.relatorioComissoes(req, res);
});
// CRUD de Comissões
router.get('/comissoes', (req, res) => {
    initController();
    vendasController.listComissoes(req, res);
});
router.post('/comissoes/:id/pagar', (req, res) => {
    initController();
    vendasController.pagarComissao(req, res);
});
router.get('/comissoes/:id', (req, res) => {
    initController();
    vendasController.getComissao(req, res);
});
// ============================================
// ROTAS DE VENDAS
// ============================================
// Estatísticas ANTES de rotas dinâmicas
router.get('/stats', (req, res) => {
    initController();
    vendasController.getVendasStats(req, res);
});
// Ranking ANTES de rotas dinâmicas
router.get('/ranking', (req, res) => {
    initController();
    vendasController.getRankingVendedores(req, res);
});
// CRUD de Vendas
router.post('/', (req, res) => {
    initController();
    vendasController.createVenda(req, res);
});
router.get('/', (req, res) => {
    initController();
    vendasController.listVendas(req, res);
});
router.post('/:id/confirmar', (req, res) => {
    initController();
    vendasController.confirmarVenda(req, res);
});
router.post('/:id/cancelar', (req, res) => {
    initController();
    vendasController.cancelarVenda(req, res);
});
router.get('/:id', (req, res) => {
    initController();
    vendasController.getVenda(req, res);
});
exports.default = router;
//# sourceMappingURL=vendas.routes.js.map