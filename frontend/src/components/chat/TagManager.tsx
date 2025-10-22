import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import chatService, { ChatTag } from '../../services/chatService';
import toast from 'react-hot-toast';

interface TagManagerProps {
  onClose?: () => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

const TagManager: React.FC<TagManagerProps> = ({ onClose }) => {
  const [tags, setTags] = useState<ChatTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newTagDescription, setNewTagDescription] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getTags();
      setTags(data);
    } catch (error) {
      toast.error('Erro ao carregar tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Digite um nome para a tag');
      return;
    }

    try {
      const newTag = await chatService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
        description: newTagDescription.trim() || undefined,
      });
      setTags([...tags, newTag]);
      setNewTagName('');
      setNewTagDescription('');
      setNewTagColor(PRESET_COLORS[0]);
      toast.success('Tag criada');
    } catch (error) {
      toast.error('Erro ao criar tag');
    }
  };

  const handleUpdateTag = async (id: string, updates: Partial<ChatTag>) => {
    try {
      const updated = await chatService.updateTag(id, updates);
      setTags(tags.map(t => t.id === id ? updated : t));
      setEditingId(null);
      toast.success('Tag atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar tag');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta tag?')) return;

    try {
      await chatService.deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
      toast.success('Tag excluída');
    } catch (error) {
      toast.error('Erro ao excluir tag');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Tags</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Create New Tag */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Nova Tag
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Nome</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: VIP, Urgente, Follow-up"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  placeholder="Descrição da tag"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Cor</label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newTagColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                      } transition-all`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateTag}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Criar Tag
              </button>
            </div>
          </div>

          {/* Tags List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tags Existentes ({tags.length})
            </h3>
            {isLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
            ) : tags.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma tag criada ainda
              </p>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    {/* Color */}
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />

                    {/* Name & Description */}
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        defaultValue={tag.name}
                        onBlur={(e) => handleUpdateTag(tag.id, { name: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded"
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {tag.name}
                        </p>
                        {tag.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {editingId === tag.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(tag.id)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
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

export default TagManager;
