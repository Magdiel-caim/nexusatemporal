"use strict";
/**
 * CEP Controller
 * Busca informações de endereço através do CEP usando a API ViaCEP
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CepController = void 0;
const axios_1 = __importDefault(require("axios"));
class CepController {
    /**
     * GET /api/cep/:cep
     * Busca informações de endereço pelo CEP
     */
    async getCep(req, res) {
        try {
            const { cep } = req.params;
            // Validar formato do CEP (apenas números, 8 dígitos)
            const cepClean = cep.replace(/\D/g, '');
            if (cepClean.length !== 8) {
                return res.status(400).json({
                    error: 'CEP inválido',
                    message: 'O CEP deve conter 8 dígitos'
                });
            }
            // Buscar CEP na API ViaCEP
            const response = await axios_1.default.get(`https://viacep.com.br/ws/${cepClean}/json/`, {
                timeout: 10000, // 10 segundos
            });
            // Verificar se o CEP foi encontrado
            if (response.data.hasOwnProperty('erro')) {
                return res.status(404).json({
                    error: 'CEP não encontrado',
                    message: 'O CEP informado não foi encontrado na base de dados'
                });
            }
            // Retornar dados formatados
            return res.json({
                cep: response.data.cep,
                street: response.data.logradouro,
                complement: response.data.complemento,
                neighborhood: response.data.bairro,
                city: response.data.localidade,
                state: response.data.uf,
                ibge: response.data.ibge,
                ddd: response.data.ddd,
            });
        }
        catch (error) {
            console.error('Erro ao buscar CEP:', error.message);
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return res.status(504).json({
                    error: 'Timeout',
                    message: 'Tempo limite excedido ao buscar CEP. Tente novamente.'
                });
            }
            if (error.response?.status === 404) {
                return res.status(404).json({
                    error: 'CEP não encontrado',
                    message: 'O CEP informado não foi encontrado na base de dados'
                });
            }
            return res.status(500).json({
                error: 'Erro ao buscar CEP',
                message: 'Ocorreu um erro ao buscar as informações do CEP'
            });
        }
    }
}
exports.CepController = CepController;
//# sourceMappingURL=cep.controller.js.map