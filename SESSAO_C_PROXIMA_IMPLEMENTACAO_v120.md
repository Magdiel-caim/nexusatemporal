# 🚀 Sessão C - Implementação v120: Interface de Disparos em Massa

**Objetivo:** Completar a implementação solicitada pelo usuário, criando a **interface de usuário** para disparos em massa via WhatsApp

**Versão:** v120-bulk-complete
**Prioridade:** ALTA
**Tempo Estimado:** 3-4 horas

---

## 📋 CONTEXTO

A v119 implementou toda a **infraestrutura backend**:
- ✅ Entities (WahaSession, BulkMessageContact, MarketingIntegration)
- ✅ Services (WahaService, MarketingIntegrationService)
- ✅ API endpoints (14 rotas novas)
- ✅ Componentes de configuração (AIProvidersConfig, WAHASessionsConfig)

**FALTA:** Interface de usuário no BulkMessageForm para o cliente **USAR** as funcionalidades.

---

## 🎯 TAREFAS A IMPLEMENTAR

### Ordem Recomendada: 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## TAREFA 1: Modificar BulkMessageForm - Seleção de Sessão WAHA

**Arquivo:** `/root/nexusatemporal/frontend/src/components/marketing/BulkMessageForm.tsx`

### 1.1. Adicionar Estado e Fetch de Sessões

```typescript
import { useState, useEffect } from 'react';

// Adicionar interface
interface WahaSession {
  id: string;
  name: string;
  displayName: string;
  phoneNumber?: string;
  status: string;
}

// Dentro do componente
const [wahaSessions, setWahaSessions] = useState<WahaSession[]>([]);
const [selectedSessionId, setSelectedSessionId] = useState<string>('');
const [loadingSessions, setLoadingSessions] = useState(false);

// Buscar sessões disponíveis
useEffect(() => {
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/marketing/waha/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filtrar apenas sessões conectadas
        const activeSessions = data.data.filter((s: WahaSession) => s.status === 'working');
        setWahaSessions(activeSessions);

        // Selecionar sessão primária automaticamente
        const primarySession = activeSessions.find((s: any) => s.isPrimary);
        if (primarySession) {
          setSelectedSessionId(primarySession.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sessões WAHA:', error);
      toast.error('Erro ao carregar sessões WhatsApp');
    } finally {
      setLoadingSessions(false);
    }
  };

  fetchSessions();
}, []);
```

### 1.2. Adicionar Campo Select no JSX

```tsx
{/* Adicionar ANTES do campo de mensagem */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Sessão WhatsApp *
  </label>

  {loadingSessions ? (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      Carregando sessões...
    </div>
  ) : wahaSessions.length === 0 ? (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-sm text-yellow-800">
        ⚠️ Nenhuma sessão WhatsApp conectada.
      </p>
      <a
        href="/integracoes-sociais"
        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
      >
        Configurar sessões WhatsApp →
      </a>
    </div>
  ) : (
    <select
      value={selectedSessionId}
      onChange={(e) => setSelectedSessionId(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      required
    >
      <option value="">Selecione uma sessão</option>
      {wahaSessions.map((session) => (
        <option key={session.id} value={session.id}>
          {session.displayName} {session.phoneNumber ? `(${session.phoneNumber})` : ''}
          {session.status === 'working' ? ' ✓' : ''}
        </option>
      ))}
    </select>
  )}

  {selectedSessionId && (
    <p className="text-xs text-gray-500 mt-1">
      Os disparos serão enviados através desta sessão WhatsApp
    </p>
  )}
</div>
```

---

## TAREFA 2: Importar Lista de Contatos CSV

### 2.1. Instalar Dependência

```bash
cd /root/nexusatemporal/frontend
npm install papaparse
npm install --save-dev @types/papaparse
```

### 2.2. Adicionar Estado e Interface

```typescript
interface Contact {
  name: string;
  phone: string;
  isValid?: boolean;
  error?: string;
}

const [contacts, setContacts] = useState<Contact[]>([]);
const [csvFile, setCsvFile] = useState<File | null>(null);
const [uploadingCSV, setUploadingCSV] = useState(false);
```

### 2.3. Criar Função de Validação

```typescript
// Validação de telefone brasileiro
const validateBRPhone = (phone: string): { isValid: boolean; cleaned: string; error?: string } => {
  // Remove tudo exceto números
  const cleaned = phone.replace(/\D/g, '');

  // Verifica se tem +55
  if (!cleaned.startsWith('55')) {
    return { isValid: false, cleaned, error: 'Falta código do país (+55)' };
  }

  // Remove o 55
  const withoutCountry = cleaned.substring(2);

  // Verifica DDD (2 dígitos)
  if (withoutCountry.length < 2) {
    return { isValid: false, cleaned, error: 'DDD incompleto' };
  }

  const ddd = withoutCountry.substring(0, 2);
  const number = withoutCountry.substring(2);

  // Verifica se número tem 8 ou 9 dígitos
  if (number.length === 9 && number[0] === '9') {
    // Celular com 9 dígitos (padrão atual)
    return { isValid: true, cleaned: `+55${ddd}${number}` };
  } else if (number.length === 8) {
    // Fixo com 8 dígitos
    return { isValid: true, cleaned: `+55${ddd}${number}` };
  } else {
    return { isValid: false, cleaned, error: 'Número deve ter 8 ou 9 dígitos' };
  }
};
```

### 2.4. Criar Função de Parse CSV

```typescript
import Papa from 'papaparse';

const handleCSVUpload = (file: File) => {
  setUploadingCSV(true);
  setCsvFile(file);

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const parsedContacts: Contact[] = results.data.map((row: any) => {
        const name = row.nome || row.name || row.Name || row.NOME || '';
        const phone = row.telefone || row.phone || row.Phone || row.TELEFONE || row.whatsapp || '';

        const validation = validateBRPhone(phone);

        return {
          name: name.trim(),
          phone: validation.cleaned,
          isValid: validation.isValid,
          error: validation.error
        };
      });

      // Filtrar apenas válidos
      const validContacts = parsedContacts.filter(c => c.isValid && c.name);
      setContacts(validContacts);

      toast.success(`${validContacts.length} contatos importados com sucesso!`);

      // Avisar sobre inválidos
      const invalidCount = parsedContacts.length - validContacts.length;
      if (invalidCount > 0) {
        toast.warning(`${invalidCount} contatos foram ignorados (inválidos)`);
      }

      setUploadingCSV(false);
    },
    error: (error) => {
      console.error('Erro ao processar CSV:', error);
      toast.error('Erro ao processar arquivo CSV');
      setUploadingCSV(false);
    }
  });
};
```

### 2.5. Adicionar UI de Upload

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Importar Lista de Contatos (CSV) *
  </label>

  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
    <input
      type="file"
      accept=".csv"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleCSVUpload(e.target.files[0]);
        }
      }}
      className="hidden"
      id="csv-upload"
      disabled={uploadingCSV}
    />

    <label
      htmlFor="csv-upload"
      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
    >
      📄 Selecionar Arquivo CSV
    </label>

    {uploadingCSV && (
      <div className="mt-2 text-sm text-gray-500">
        Processando arquivo...
      </div>
    )}

    {csvFile && !uploadingCSV && (
      <div className="mt-2 text-sm text-gray-600">
        Arquivo: {csvFile.name}
      </div>
    )}
  </div>

  {/* Preview dos contatos */}
  {contacts.length > 0 && (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-green-800">
          ✓ {contacts.length} contatos prontos para envio
        </h4>
        <button
          onClick={() => setContacts([])}
          className="text-xs text-red-600 hover:underline"
        >
          Limpar lista
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-green-100">
            <tr>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.slice(0, 10).map((contact, index) => (
              <tr key={index} className="border-t border-green-200">
                <td className="p-2">{contact.name}</td>
                <td className="p-2">{contact.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length > 10 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            ... e mais {contacts.length - 10} contatos
          </p>
        )}
      </div>
    </div>
  )}

  {/* Instruções */}
  <div className="mt-2 text-xs text-gray-500">
    <p className="font-medium mb-1">Formato do CSV:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Colunas: <code className="bg-gray-100 px-1">nome,telefone</code></li>
      <li>Telefone: formato +5511999999999 ou 11999999999</li>
      <li>Aceita 8 ou 9 dígitos (fixo ou celular)</li>
    </ul>
    <a
      href="/exemplo-contatos.csv"
      download
      className="text-blue-600 hover:underline mt-1 inline-block"
    >
      Baixar arquivo de exemplo →
    </a>
  </div>
</div>
```

### 2.6. Criar Arquivo CSV de Exemplo

**Arquivo:** `/root/nexusatemporal/frontend/public/exemplo-contatos.csv`

```csv
nome,telefone
João Silva,5511999999999
Maria Santos,11988888888
Pedro Oliveira,+5521987654321
Ana Costa,21976543210
```

---

## TAREFA 3: Botão "Usar IA" para Criar Mensagem

### 3.1. Adicionar Estado

```typescript
const [aiGenerating, setAiGenerating] = useState(false);
const [aiPrompt, setAiPrompt] = useState('');
const [showAIModal, setShowAIModal] = useState(false);
```

### 3.2. Criar Função de Geração

```typescript
const handleGenerateWithAI = async () => {
  if (!aiPrompt.trim()) {
    toast.error('Digite uma instrução para a IA');
    return;
  }

  setAiGenerating(true);

  try {
    const response = await fetch('/api/marketing/ai-assistant/generate-copy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        prompt: aiPrompt,
        context: {
          platform: 'whatsapp',
          audience: 'leads',
          goal: 'engagement'
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      setMessage(data.output.generatedText);
      setShowAIModal(false);
      setAiPrompt('');
      toast.success('Mensagem gerada com sucesso!');
    } else {
      toast.error(data.message || 'Erro ao gerar mensagem');
    }
  } catch (error) {
    console.error('Erro ao gerar com IA:', error);
    toast.error('Erro ao comunicar com a IA');
  } finally {
    setAiGenerating(false);
  }
};
```

### 3.3. Adicionar UI

```tsx
{/* Campo de mensagem com botão IA */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Mensagem *
    </label>
    <button
      type="button"
      onClick={() => setShowAIModal(true)}
      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
    >
      ✨ Usar IA
    </button>
  </div>

  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    rows={6}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
    placeholder="Digite a mensagem que será enviada para todos os contatos..."
    required
  />

  <p className="text-xs text-gray-500 mt-1">
    Você pode usar variáveis: {'{nome}'} será substituído pelo nome do contato
  </p>
</div>

{/* Modal IA */}
{showAIModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">✨ Gerar Mensagem com IA</h3>
        <button
          onClick={() => setShowAIModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <textarea
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
        placeholder="Ex: Criar mensagem de vendas para curso online de marketing, tom amigável e profissional, incluir call-to-action"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setShowAIModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          disabled={aiGenerating}
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerateWithAI}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={aiGenerating}
        >
          {aiGenerating ? 'Gerando...' : 'Gerar'}
        </button>
      </div>
    </div>
  </div>
)}
```

---

## TAREFA 4: Upload de Imagem

### 4.1. Adicionar Estado

```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
const [uploadingImage, setUploadingImage] = useState(false);
const [imageUrl, setImageUrl] = useState<string>('');
```

### 4.2. Criar Função de Upload

```typescript
const handleImageUpload = async (file: File) => {
  // Validar tamanho (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Imagem muito grande. Máximo 5MB');
    return;
  }

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    toast.error('Arquivo deve ser uma imagem');
    return;
  }

  setImageFile(file);
  setImagePreviewUrl(URL.createObjectURL(file));
  setUploadingImage(true);

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/marketing/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setImageUrl(data.url);
      toast.success('Imagem enviada com sucesso!');
    } else {
      toast.error('Erro ao enviar imagem');
      setImageFile(null);
      setImagePreviewUrl('');
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    toast.error('Erro ao enviar imagem');
    setImageFile(null);
    setImagePreviewUrl('');
  } finally {
    setUploadingImage(false);
  }
};
```

### 4.3. Adicionar UI

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Imagem (Opcional)
  </label>

  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
    {!imagePreviewUrl ? (
      <div className="text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImageUpload(e.target.files[0]);
            }
          }}
          className="hidden"
          id="image-upload"
          disabled={uploadingImage}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          🖼️ Adicionar Imagem
        </label>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG ou GIF • Máx. 5MB
        </p>
      </div>
    ) : (
      <div className="relative">
        <img
          src={imagePreviewUrl}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
        {uploadingImage && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        {!uploadingImage && (
          <button
            onClick={() => {
              setImageFile(null);
              setImagePreviewUrl('');
              setImageUrl('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        )}
      </div>
    )}
  </div>
</div>
```

---

## TAREFA 5: Controles de Randomização

### 5.1. Adicionar Estado

```typescript
const [minDelay, setMinDelay] = useState(1);
const [maxDelay, setMaxDelay] = useState(5);
```

### 5.2. Adicionar UI

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Intervalo entre Mensagens
  </label>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Mínimo (segundos)</label>
      <input
        type="number"
        value={minDelay}
        onChange={(e) => {
          const val = Number(e.target.value);
          setMinDelay(Math.max(1, Math.min(val, maxDelay - 1)));
        }}
        min={1}
        max={60}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>

    <div>
      <label className="text-xs text-gray-500 mb-1 block">Máximo (segundos)</label>
      <input
        type="number"
        value={maxDelay}
        onChange={(e) => {
          const val = Number(e.target.value);
          setMaxDelay(Math.max(minDelay + 1, Math.min(val, 60)));
        }}
        min={1}
        max={60}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
  </div>

  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
    <p className="text-xs text-blue-800">
      ⏱️ Tempo aleatório entre <strong>{minDelay}s</strong> e <strong>{maxDelay}s</strong> entre cada mensagem
    </p>
    <p className="text-xs text-blue-600 mt-1">
      Tempo estimado total: {Math.ceil((contacts.length * (minDelay + maxDelay) / 2) / 60)} minutos
    </p>
  </div>
</div>
```

---

## TAREFA 6: Agendar vs Enviar Imediatamente

### 6.1. Adicionar Estado

```typescript
const [sendMode, setSendMode] = useState<'immediate' | 'scheduled'>('immediate');
const [scheduledDate, setScheduledDate] = useState<string>('');
```

### 6.2. Adicionar UI

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Quando Enviar?
  </label>

  <div className="space-y-3">
    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
      <input
        type="radio"
        name="sendMode"
        value="immediate"
        checked={sendMode === 'immediate'}
        onChange={() => setSendMode('immediate')}
        className="w-4 h-4 text-blue-500"
      />
      <div>
        <div className="font-medium">Enviar Imediatamente</div>
        <div className="text-xs text-gray-500">Os disparos começarão assim que você clicar em "Enviar"</div>
      </div>
    </label>

    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
      <input
        type="radio"
        name="sendMode"
        value="scheduled"
        checked={sendMode === 'scheduled'}
        onChange={() => setSendMode('scheduled')}
        className="w-4 h-4 text-blue-500"
      />
      <div className="flex-1">
        <div className="font-medium">Agendar Envio</div>
        <div className="text-xs text-gray-500 mb-2">Escolha data e hora para iniciar os disparos</div>

        {sendMode === 'scheduled' && (
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required={sendMode === 'scheduled'}
          />
        )}
      </div>
    </label>
  </div>
</div>
```

---

## TAREFA 7: Integrar Submit com API

### 7.1. Modificar Função de Submit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validações
  if (!selectedSessionId) {
    toast.error('Selecione uma sessão WhatsApp');
    return;
  }

  if (contacts.length === 0) {
    toast.error('Importe uma lista de contatos');
    return;
  }

  if (!message.trim()) {
    toast.error('Digite uma mensagem');
    return;
  }

  if (sendMode === 'scheduled' && !scheduledDate) {
    toast.error('Selecione data e hora do agendamento');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/marketing/bulk-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        sessionId: selectedSessionId,
        contacts: contacts,
        message: message,
        imageUrl: imageUrl || null,
        minDelaySeconds: minDelay,
        maxDelaySeconds: maxDelay,
        scheduledFor: sendMode === 'scheduled' ? new Date(scheduledDate).toISOString() : null
      })
    });

    const data = await response.json();

    if (data.success) {
      toast.success(
        sendMode === 'immediate'
          ? `Disparo iniciado! ${contacts.length} mensagens na fila`
          : `Disparo agendado para ${new Date(scheduledDate).toLocaleString()}`
      );

      // Resetar form
      setContacts([]);
      setMessage('');
      setImageFile(null);
      setImagePreviewUrl('');
      setImageUrl('');
      setCsvFile(null);
      setScheduledDate('');
      setSendMode('immediate');

      // Redirecionar para lista de disparos
      // router.push('/marketing/disparos');
    } else {
      toast.error(data.message || 'Erro ao criar disparo');
    }
  } catch (error) {
    console.error('Erro ao criar disparo:', error);
    toast.error('Erro ao comunicar com o servidor');
  } finally {
    setLoading(false);
  }
};
```

---

## TAREFA 8: Backend - Criar Endpoints Faltantes

### 8.1. Upload de Imagem

**Arquivo:** `/root/nexusatemporal/backend/src/modules/marketing/marketing.controller.ts`

```typescript
// Instalar multer primeiro: npm install multer @types/multer

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/marketing');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// No controller
async uploadImage(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const file = (req as any).file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // URL pública da imagem
    const imageUrl = `${process.env.BACKEND_URL}/uploads/marketing/${file.filename}`;

    res.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error('[MarketingController] Upload image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
```

**Rota:** `marketing.routes.ts`

```typescript
import multer from 'multer';

// Depois de authenticate
router.post('/upload-image', upload.single('image'), (req, res) =>
  controller.uploadImage(req, res)
);
```

### 8.2. Gerar Copy com IA

**Arquivo:** `/root/nexusatemporal/backend/src/modules/marketing/services/ai-assistant.service.ts`

Adicionar método:

```typescript
async generateCopy(
  tenantId: string,
  prompt: string,
  context?: { platform?: string; audience?: string; goal?: string }
): Promise<{ generatedText: string; variations: string[] }> {
  // Por enquanto, retornar placeholder
  // Na próxima versão, implementar chamadas reais para OpenRouter/Groq

  return {
    generatedText: `Olá {nome}! 👋\n\nTenho uma novidade incrível para você!\n\n${prompt}\n\nQuer saber mais? Responda esta mensagem!`,
    variations: [
      'Variação 1: Mais formal',
      'Variação 2: Mais casual',
      'Variação 3: Com urgência'
    ]
  };
}
```

**Controller:** `marketing.controller.ts`

```typescript
async generateAICopy(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const { prompt, context } = req.body;

    const result = await this.aiAssistantService.generateCopy(tenantId, prompt, context);

    res.json({
      success: true,
      output: result
    });
  } catch (error: any) {
    console.error('[MarketingController] Generate copy error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
```

**Rota:**

```typescript
router.post('/ai-assistant/generate-copy', (req, res) =>
  controller.generateAICopy(req, res)
);
```

---

## TAREFA 9: Sistema de Fila (Bull/BullMQ)

### 9.1. Instalar Dependências

```bash
cd /root/nexusatemporal/backend
npm install bullmq ioredis
```

### 9.2. Criar Worker

**Arquivo:** `/root/nexusatemporal/backend/src/modules/marketing/workers/bulk-message.worker.ts`

```typescript
import { Worker, Queue } from 'bullmq';
import { AppDataSource } from '../../../database/data-source';
import { BulkMessageContact } from '../entities/bulk-message-contact.entity';
import { WahaService } from '../services/waha.service';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const bulkMessageQueue = new Queue('bulk-messages', { connection });

const worker = new Worker('bulk-messages', async (job) => {
  const { bulkMessageId, sessionId, tenantId, message, imageUrl, contacts, minDelay, maxDelay } = job.data;

  console.log(`[BulkWorker] Processing bulk message ${bulkMessageId} with ${contacts.length} contacts`);

  const wahaService = new WahaService();
  const contactRepo = AppDataSource.getRepository(BulkMessageContact);

  for (const contact of contacts) {
    try {
      // Delay aleatório
      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      console.log(`[BulkWorker] Waiting ${randomDelay.toFixed(1)}s before sending to ${contact.name}`);
      await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));

      // Personalizar mensagem (substituir {nome})
      const personalizedMessage = message.replace(/{nome}/g, contact.name);

      // Enviar mensagem
      await wahaService.sendMessage(sessionId, tenantId, {
        phoneNumber: contact.phone,
        message: personalizedMessage,
        mediaUrl: imageUrl || undefined
      });

      // Atualizar status
      await contactRepo.update(
        { bulkMessageId, phoneNumber: contact.phone },
        {
          status: 'sent',
          personalizedContent: personalizedMessage,
          sentAt: new Date()
        }
      );

      console.log(`[BulkWorker] ✓ Sent to ${contact.name} (${contact.phone})`);

    } catch (error: any) {
      console.error(`[BulkWorker] ✗ Failed to send to ${contact.name}:`, error.message);

      await contactRepo.update(
        { bulkMessageId, phoneNumber: contact.phone },
        {
          status: 'failed',
          errorMessage: error.message,
          failedAt: new Date()
        }
      );
    }

    // Update job progress
    await job.updateProgress((contacts.indexOf(contact) + 1) / contacts.length * 100);
  }

  console.log(`[BulkWorker] ✓ Completed bulk message ${bulkMessageId}`);

}, { connection });

worker.on('completed', (job) => {
  console.log(`[BulkWorker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[BulkWorker] Job ${job?.id} failed:`, err);
});

export default worker;
```

### 9.3. Modificar Endpoint de Criação

**Arquivo:** `marketing.controller.ts`

```typescript
import { bulkMessageQueue } from './workers/bulk-message.worker';

async createBulkMessage(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;
    const {
      sessionId,
      contacts,
      message,
      imageUrl,
      minDelaySeconds = 1,
      maxDelaySeconds = 5,
      scheduledFor
    } = req.body;

    // Criar bulk message
    const bulkMessage = await this.bulkMessageService.create({
      tenantId,
      sessionId,
      message,
      imageUrl,
      totalContacts: contacts.length,
      status: scheduledFor ? 'scheduled' : 'processing',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      createdBy: userId
    });

    // Criar registros de contatos
    for (const contact of contacts) {
      await contactRepository.create({
        bulkMessageId: bulkMessage.id,
        name: contact.name,
        phoneNumber: contact.phone,
        status: 'pending'
      });
    }

    // Adicionar à fila
    const delay = scheduledFor
      ? new Date(scheduledFor).getTime() - Date.now()
      : 0;

    await bulkMessageQueue.add('send-bulk', {
      bulkMessageId: bulkMessage.id,
      sessionId,
      tenantId,
      message,
      imageUrl,
      contacts,
      minDelay: minDelaySeconds,
      maxDelay: maxDelaySeconds
    }, {
      delay: Math.max(0, delay)
    });

    res.json({
      success: true,
      data: bulkMessage,
      message: scheduledFor
        ? `Disparo agendado para ${new Date(scheduledFor).toLocaleString()}`
        : 'Disparo iniciado! Processamento em andamento.'
    });

  } catch (error: any) {
    console.error('[MarketingController] Create bulk message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
```

### 9.4. Iniciar Worker no Server

**Arquivo:** `/root/nexusatemporal/backend/src/server.ts`

```typescript
// No final do arquivo, antes de app.listen()

// Iniciar worker de bulk messages
import './modules/marketing/workers/bulk-message.worker';
console.log('✓ Bulk message worker started');
```

---

## 📦 RESUMO DE DEPENDÊNCIAS A INSTALAR

```bash
# Frontend
cd /root/nexusatemporal/frontend
npm install papaparse
npm install --save-dev @types/papaparse

# Backend
cd /root/nexusatemporal/backend
npm install multer @types/multer bullmq ioredis
```

---

## 🧪 TESTE FINAL

Após implementar tudo:

1. **Testar Fluxo Completo:**
   - Ir em Integrações → Configurar provedor IA
   - Ir em Integrações → Criar sessão WAHA e conectar
   - Ir em Marketing → Disparos em Massa
   - Importar CSV com 2-3 contatos
   - Clicar em "Usar IA" e gerar mensagem
   - Adicionar imagem
   - Ajustar delays (2s - 4s)
   - Selecionar "Enviar Imediatamente"
   - Enviar

2. **Verificar:**
   - Mensagens chegando no WhatsApp
   - Status atualizando (pending → sent → delivered)
   - Delays sendo respeitados
   - Imagem sendo enviada
   - Variável {nome} sendo substituída

---

## 🚀 BUILD E DEPLOY

```bash
# 1. Build backend
cd /root/nexusatemporal/backend
npm run build

# 2. Build frontend
cd ../frontend
npm run build

# 3. Criar imagens Docker
docker build -t nexus-backend:v120-bulk-complete -f backend/Dockerfile backend/
docker build -t nexus-frontend:v120-bulk-complete -f frontend/Dockerfile frontend/

# 4. Deploy
docker service update --image nexus-backend:v120-bulk-complete nexus_backend
docker service update --image nexus-frontend:v120-bulk-complete nexus_frontend

# 5. Verificar
docker service logs nexus_backend --tail 50
docker service logs nexus_frontend --tail 50
```

---

## ✅ CHECKLIST FINAL

- [ ] Seleção de sessão WAHA no form
- [ ] Upload e validação de CSV
- [ ] Botão "Usar IA" funcionando
- [ ] Upload de imagem
- [ ] Controles de randomização
- [ ] Opção agendar vs enviar
- [ ] Endpoint upload-image
- [ ] Endpoint generate-copy
- [ ] Sistema de fila Bull
- [ ] Worker processando disparos
- [ ] Testes com 3 contatos reais
- [ ] Deploy em produção
- [ ] Documentação atualizada

---

**Tempo Estimado Total:** 3-4 horas
**Prioridade:** MÁXIMA
**Próxima Versão:** v120-bulk-complete

**Boa sorte, Sessão C! 🚀**
