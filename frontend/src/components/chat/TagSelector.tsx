import React, { useState, useEffect } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import chatService, { ChatTag } from '../../services/chatService';
import toast from 'react-hot-toast';

interface TagSelectorProps {
  conversationId: string;
  selectedTags: string[];
  onUpdate?: () => void;
  onManageTags?: () => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  conversationId,
  selectedTags,
  onUpdate,
  onManageTags,
}) => {
  const [availableTags, setAvailableTags] = useState<ChatTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const tags = await chatService.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (tagName: string) => {
    try {
      await chatService.addTag(conversationId, tagName);
      toast.success('Tag adicionada');
      onUpdate?.();
      setShowDropdown(false);
    } catch (error) {
      toast.error('Erro ao adicionar tag');
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    try {
      await chatService.removeTag(conversationId, tagName);
      toast.success('Tag removida');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao remover tag');
    }
  };

  const getTagColor = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  };

  const unselectedTags = availableTags.filter(
    tag => !selectedTags.includes(tag.name)
  );

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagName) => (
            <span
              key={tagName}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: getTagColor(tagName) }}
            >
              {tagName}
              <button
                onClick={() => handleRemoveTag(tagName)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Tag Button */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar Tag
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                Carregando...
              </div>
            ) : unselectedTags.length === 0 ? (
              <div className="p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Todas as tags foram adicionadas
                </p>
                {onManageTags && (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onManageTags();
                    }}
                    className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Gerenciar Tags
                  </button>
                )}
              </div>
            ) : (
              <>
                {unselectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-gray-900 dark:text-white">{tag.name}</span>
                    {tag.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-auto">
                        {tag.description}
                      </span>
                    )}
                  </button>
                ))}
                {onManageTags && (
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onManageTags();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <TagIcon className="h-4 w-4" />
                      Gerenciar Tags
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
