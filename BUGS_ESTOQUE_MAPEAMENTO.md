# MAPEAMENTO COMPLETO DE BUGS - Módulo de Estoque
**Data:** 08/11/2025
**Análise:** FASE 1 - ANÁLISE PROFUNDA
**Metodologia:** 4 Fases com Excelência Máxima

---

## 🔴 BUGS CRÍTICOS IDENTIFICADOS

### 1. **UNIDADES DE MEDIDA - INCOMPATIBILIDADE BACKEND/FRONTEND**

**Severidade:** 🔴 CRÍTICO
**Impacto:** Sistema quebrado, dados inconsistentes

**Backend** (`backend/src/modules/estoque/product.entity.ts`):
```typescript
export enum ProductUnit {
  UNIDADE = 'unidade',      // ← lowercase
  CAIXA = 'caixa',          // ← lowercase
  FRASCO = 'frasco',
  AMPOLA = 'ampola',
  ML = 'ml',
  G = 'g',
  KG = 'kg',
  LITRO = 'litro',
  METRO = 'metro',
  OUTRO = 'outro',
}
```

**Frontend** (`frontend/src/services/stockService.ts`):
```typescript
export enum ProductUnit {
  UNIDADE = 'UN',           // ← DIFERENTE!
  CAIXA = 'CX',             // ← DIFERENTE!
  FRASCO = 'FR',
  AMPOLA = 'AMP',
  COMPRIMIDO = 'CP',        // ← NÃO EXISTE NO BACKEND!
  ML = 'ML',
  LITRO = 'L',
  GRAMA = 'G',
  KG = 'KG',
}
```

**Problema:**
- Valores salvos no backend: `'unidade'`, `'caixa'`, etc
- Frontend espera: `'UN'`, `'CX'`, etc
- **RESULTADO:** Produtos não exibem unidade corretamente!

**Solução:**
- Padronizar para lowercase no backend (já está)
- Ajustar frontend para usar mesmos valores

---

### 2. **DARK MODE - NÃO APLICADO COMPLETAMENTE**

**Severidade:** 🟠 ALTO
**Impacto:** UX ruim, ilegível em dark mode

#### 2.1 ProductList.tsx

**Linha 135** - Input de busca:
```tsx
// ❌ ATUAL
className="... text-gray-900 bg-white placeholder-gray-400"

// ✅ DEVERIA SER
className="... text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
```

**Linha 143** - Select de categoria:
```tsx
// ❌ ATUAL
className="... text-gray-900 bg-white"

// ✅ DEVERIA SER
className="... text-gray-900 dark:text-white bg-white dark:bg-gray-700"
```

**Linha 162** - Label "Estoque baixo":
```tsx
// ❌ ATUAL
<span className="text-sm text-gray-700">Estoque baixo</span>

// ✅ DEVERIA SER
<span className="text-sm text-gray-700 dark:text-gray-300">Estoque baixo</span>
```

**Linha 171** - Label "Somente ativos":
```tsx
// ❌ ATUAL
<span className="text-sm text-gray-700">Somente ativos</span>

// ✅ DEVERIA SER
<span className="text-sm text-gray-700 dark:text-gray-300">Somente ativos</span>
```

**Linhas 179-186** - Empty state:
```tsx
// ❌ ATUAL
<div className="bg-white rounded-xl ...">
  <h3 className="... text-gray-900 ...">Nenhum produto encontrado</h3>
  <p className="text-gray-600">...</p>
</div>

// ✅ DEVERIA SER
<div className="bg-white dark:bg-gray-800 rounded-xl ...">
  <h3 className="... text-gray-900 dark:text-white ...">Nenhum produto encontrado</h3>
  <p className="text-gray-600 dark:text-gray-400">...</p>
</div>
```

**Linha 226** - Highlight de linha (estoque baixo/sem estoque):
```tsx
// ❌ ATUAL - Background fixo sobrescreve dark mode
className={`... ${
  isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''
}`}

// ✅ DEVERIA SER
className={`... ${
  isOutOfStock ? 'bg-red-50 dark:bg-red-900/20' :
  isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
}`}
```

#### 2.2 ProductForm.tsx

**TODAS AS LINHAS** com inputs/selects (114, 124, 136, 146, 163, 188, 200, 213, 226, 239):
```tsx
// ❌ ATUAL
className="... text-gray-900 bg-white"

// ✅ DEVERIA SER
className="... text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
```

---

### 3. **THEMETOGGLE DUPLICADO**

**Severidade:** 🟡 MÉDIO
**Impacto:** Confusão UX, componente duplicado

**Arquivo:** `frontend/src/pages/EstoquePage.tsx` (linha ~329)

**❌ Problema:**
```tsx
<div className="flex items-center space-x-3">
  <ThemeToggle />  {/* ← NÃO DEVERIA ESTAR AQUI */}
  <button>Novo Produto</button>
  <button>Nova Movimentação</button>
</div>
```

**✅ Solução:**
```tsx
<div className="flex items-center space-x-3">
  {/* ThemeToggle removido - já existe no menu principal */}
  <button>Novo Produto</button>
  <button>Nova Movimentação</button>
</div>
```

---

### 4. **CHECKBOXES NÃO TÊM BORDER EM DARK MODE**

**Severidade:** 🟡 MÉDIO
**Impacto:** Checkboxes invisíveis em dark mode

**ProductList.tsx** linhas 156-172:
```tsx
// ❌ ATUAL
<input
  type="checkbox"
  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
/>

// ✅ DEVERIA SER
<input
  type="checkbox"
  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-700 focus:ring-blue-500"
/>
```

---

## 📊 RESUMO DOS BUGS

| # | Bug | Arquivo | Severidade | Status |
|---|-----|---------|------------|--------|
| 1 | Unidades incompatíveis Backend/Frontend | product.entity.ts, stockService.ts | 🔴 CRÍTICO | ✅ RESOLVIDO |
| 2.1 | Dark mode - Input busca | ProductList.tsx:135 | 🟠 ALTO | ✅ RESOLVIDO |
| 2.2 | Dark mode - Select categoria | ProductList.tsx:143 | 🟠 ALTO | ✅ RESOLVIDO |
| 2.3 | Dark mode - Labels filtros | ProductList.tsx:162,171 | 🟠 ALTO | ✅ RESOLVIDO |
| 2.4 | Dark mode - Empty state | ProductList.tsx:179-186 | 🟠 ALTO | ✅ RESOLVIDO |
| 2.5 | Dark mode - Highlight linhas | ProductList.tsx:226 | 🟠 ALTO | ✅ RESOLVIDO |
| 2.6 | Dark mode - Checkboxes | ProductList.tsx:156-172 | 🟡 MÉDIO | ✅ RESOLVIDO |
| 2.7 | Dark mode - TODOS inputs | ProductForm.tsx (múltiplas linhas) | 🟠 ALTO | ✅ RESOLVIDO |
| 3 | ThemeToggle duplicado | EstoquePage.tsx:329 | 🟡 MÉDIO | ✅ RESOLVIDO |

**Total de bugs:** 9 bugs identificados
**Críticos:** 1 ✅
**Altos:** 6 ✅
**Médios:** 2 ✅
**TODOS RESOLVIDOS:** ✅ 100%

---

## 🎯 PLANO DE CORREÇÃO (FASE 2)

### Prioridade 1 - CRÍTICO
1. ✅ Corrigir unidades de medida (backend + frontend)

### Prioridade 2 - ALTO
2. ✅ Aplicar dark mode completo em ProductList.tsx
3. ✅ Aplicar dark mode completo em ProductForm.tsx

### Prioridade 3 - MÉDIO
4. ✅ Remover ThemeToggle duplicado
5. ✅ Corrigir checkboxes dark mode

**Status:** ✅ TODAS AS PRIORIDADES CONCLUÍDAS
**Documentação completa:** Ver `BUGS_ESTOQUE_CORRECOES_FASE2.md`

---

## 📋 TESTE PARA VERIFICAÇÃO

Após correções, testar:

1. **Unidades de Medida:**
   - [ ] Criar produto com unidade "Unidade"
   - [ ] Verificar se salva como "unidade" no banco
   - [ ] Verificar se exibe corretamente na lista

2. **Dark Mode:**
   - [ ] Ativar dark mode
   - [ ] Acessar /estoque/produtos
   - [ ] Verificar se TODOS os inputs/selects estão com fundo escuro
   - [ ] Verificar se labels estão visíveis
   - [ ] Verificar se checkboxes têm border visível
   - [ ] Verificar se highlight de linhas funciona

3. **ThemeToggle:**
   - [ ] Verificar que só existe 1 botão de dark mode (no menu)
   - [ ] Botão não aparece duplicado na página de estoque

---

**Próxima etapa:** FASE 2 - IMPLEMENTAÇÃO DAS CORREÇÕES
