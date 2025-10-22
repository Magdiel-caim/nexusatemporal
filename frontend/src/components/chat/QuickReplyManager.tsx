import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check, Zap, Search, Folder } from 'lucide-react';
import chatService, { QuickReply } from '../../services/chatService';
import toast from 'react-hot-toast';

interface QuickReplyManagerProps {
  onClose?: () => void;
  onSelect?: (content: string) => void; // Para selecionar e usar uma quick reply
}

const COMMON_CATEGORIES = [
  'Saudações',
  'Agendamento',
  'Informações',
  'Despedida',
  'Suporte',
  'Financeiro',
  'Outros',
];

const QuickReplyManager: React.FC<QuickReplyManagerProps> = ({ onClose, onSelect }) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New quick reply form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newShortcut, setNewShortcut] = useState('');
  const [newCategory, setNewCategory] = useState('Outros');
  const [isGlobal, setIsGlobal] = useState(false);

  useEffect(() => {
    loadQuickReplies();
  }, []);

  const loadQuickReplies = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getQuickReplies({});
      setQuickReplies(data);
    } catch (error) {
      toast.error('Erro ao carregar respostas rápidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const created = await chatService.createQuickReply({
        title: newTitle.trim(),
        content: newContent.trim(),
        shortcut: newShortcut.trim() || undefined,
        category: newCategory,
        isGlobal,
      });

      setQuickReplies([...quickReplies, created]);

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewShortcut('');
      setNewCategory('Outros');
      setIsGlobal(false);

      toast.success('Resposta rápida criada');
    } catch (error) {
      toast.error('Erro ao criar resposta rápida');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<QuickReply>) => {
    try {
      const updated = await chatService.updateQuickReply(id, updates);
      setQuickReplies(quickReplies.map(qr => qr.id === id ? updated : qr));
      setEditingId(null);
      toast.success('Resposta rápida atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar resposta rápida');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta resposta rápida?')) return;

    try {
      await chatService.deleteQuickReply(id);
      setQuickReplies(quickReplies.filter(qr => qr.id !== id));
      toast.success('Resposta rápida excluída');
    } catch (error) {
      toast.error('Erro ao excluir resposta rápida');
    }
  };

  const handleSelectReply = (content: string) => {
    if (onSelect) {
      onSelect(content);
      onClose?.();
    }
  };

  // Filtrar respostas
  const filteredReplies = quickReplies.filter(qr => {
    const matchesSearch = searchTerm === '' ||
      qr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.shortcut?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || qr.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Agrupar por categoria
  const categorizedReplies = filteredReplies.reduce((acc, qr) => {
    const cat = qr.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(qr);
    return acc;
  }, {} as Record<string, QuickReply[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-600" />
            Respostas Rápidas
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Create New Quick Reply */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Nova Resposta Rápida
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Título *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Saudação Inicial"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Atalho</label>
                <input
                  type="text"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="Ex: /oi"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Conteúdo * <span className="text-xs text-gray-500">(Suporta variáveis: {'{'}nome{'}'}, {'{'}telefone{'}'})</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Olá {nome}, tudo bem? Como posso ajudar?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {COMMON_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={isGlobal}
                    onChange={(e) => setIsGlobal(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs">Global (todos podem usar)</span>
                </label>
              </div>
              <div className="col-span-2">
                <button
                  onClick={handleCreate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Criar Resposta Rápida
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, conteúdo ou atalho..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">Todas categorias</option>
              {COMMON_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Quick Replies List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Respostas Existentes ({filteredReplies.length})
            </h3>
            {isLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
            ) : Object.keys(categorizedReplies).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma resposta rápida encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorizedReplies).map(([category, replies]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {category} ({replies.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {replies.map((qr) => (
                        <div
                          key={qr.id}
                          className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {qr.title}
                                </p>
                                {qr.shortcut && (
                                  <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                                    {qr.shortcut}
                                  </span>
                                )}
                                {qr.isGlobal && (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    Global
                                  </span>
                                )}
                              </div>
                              {editingId === qr.id ? (
                                <textarea
                                  defaultValue={qr.content}
                                  onBlur={(e) => handleUpdate(qr.id, { content: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm"
                                  rows={2}
                                  autoFocus
                                />
                              ) : (
                                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                  {qr.content}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {onSelect && (
                                <button
                                  onClick={() => handleSelectReply(qr.content)}
                                  className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-600"
                                  title="Usar resposta"
                                >
                                  <Zap className="h-4 w-4" />
                                </button>
                              )}
                              {editingId === qr.id ? (
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingId(qr.id)}
                                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(qr.id)}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickReplyManager;
