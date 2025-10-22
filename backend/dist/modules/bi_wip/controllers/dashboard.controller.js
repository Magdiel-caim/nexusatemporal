"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    /**
     * POST /api/bi/dashboards
     * Criar nova configuração de dashboard
     */
    async create(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dto = req.body;
        const dashboard = await this.dashboardService.create(userId, tenantId, dto);
        return res.status(201).json(dashboard);
    }
    /**
     * GET /api/bi/dashboards
     * Listar todos dashboards do usuário
     */
    async findAll(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboards = await this.dashboardService.findAll(userId, tenantId);
        return res.json(dashboards);
    }
    /**
     * GET /api/bi/dashboards/default/:type
     * Buscar dashboard padrão por tipo
     */
    async findDefault(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const type = req.params.type;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboard = await this.dashboardService.findDefaultByType(userId, tenantId, type);
        return res.json(dashboard);
    }
    /**
     * GET /api/bi/dashboards/:id
     * Buscar dashboard por ID
     */
    async findOne(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboard = await this.dashboardService.findOne(id, userId, tenantId);
        return res.json(dashboard);
    }
    /**
     * GET /api/bi/dashboards/:id/data
     * Obter dados do dashboard
     */
    async getData(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        const filters = req.query;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const data = await this.dashboardService.getDashboardData(id, userId, tenantId, filters);
        return res.json(data);
    }
    /**
     * PUT /api/bi/dashboards/:id
     * Atualizar dashboard
     */
    async update(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        const dto = req.body;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboard = await this.dashboardService.update(id, userId, tenantId, dto);
        return res.json(dashboard);
    }
    /**
     * PUT /api/bi/dashboards/:id/set-default
     * Definir dashboard como padrão
     */
    async setAsDefault(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboard = await this.dashboardService.setAsDefault(id, userId, tenantId);
        return res.json(dashboard);
    }
    /**
     * POST /api/bi/dashboards/:id/clone
     * Clonar dashboard
     */
    async clone(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        const newName = req.body.name;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const dashboard = await this.dashboardService.clone(id, userId, tenantId, newName);
        return res.json(dashboard);
    }
    /**
     * DELETE /api/bi/dashboards/:id
     * Deletar dashboard
     */
    async delete(req, res) {
        const userId = req.user?.userId;
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        if (!userId || !tenantId) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        await this.dashboardService.delete(id, userId, tenantId);
        return res.json({ message: 'Dashboard deletado com sucesso' });
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map