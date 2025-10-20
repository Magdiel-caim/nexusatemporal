"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstoqueModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
// Entities
const product_entity_1 = require("./product.entity");
const stock_movement_entity_1 = require("./stock-movement.entity");
const stock_alert_entity_1 = require("./stock-alert.entity");
const procedure_product_entity_1 = require("./procedure-product.entity");
const purchase_order_entity_1 = require("../financeiro/purchase-order.entity");
const supplier_entity_1 = require("../financeiro/supplier.entity");
// Services
const product_service_1 = require("./product.service");
const stock_movement_service_1 = require("./stock-movement.service");
const stock_alert_service_1 = require("./stock-alert.service");
// Controllers
const product_controller_1 = require("./product.controller");
const stock_movement_controller_1 = require("./stock-movement.controller");
const stock_alert_controller_1 = require("./stock-alert.controller");
let EstoqueModule = class EstoqueModule {
};
exports.EstoqueModule = EstoqueModule;
exports.EstoqueModule = EstoqueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                product_entity_1.Product,
                stock_movement_entity_1.StockMovement,
                stock_alert_entity_1.StockAlert,
                procedure_product_entity_1.ProcedureProduct,
                purchase_order_entity_1.PurchaseOrder,
                supplier_entity_1.Supplier,
            ]),
            schedule_1.ScheduleModule.forRoot(), // Para cron jobs
        ],
        controllers: [product_controller_1.ProductController, stock_movement_controller_1.StockMovementController, stock_alert_controller_1.StockAlertController],
        providers: [product_service_1.ProductService, stock_movement_service_1.StockMovementService, stock_alert_service_1.StockAlertService],
        exports: [product_service_1.ProductService, stock_movement_service_1.StockMovementService, stock_alert_service_1.StockAlertService],
    })
], EstoqueModule);
//# sourceMappingURL=estoque.module.js.map