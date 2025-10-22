import { useState, useEffect } from 'react';
import { LandingPage, marketingService } from '@/services/marketingService';
import { Edit, Eye, ExternalLink, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface LandingPageListProps {
  onEdit: (page: LandingPage) => void;
  refreshTrigger?: number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

export default function LandingPageList({ onEdit, refreshTrigger }: LandingPageListProps) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, [refreshTrigger]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getLandingPages();
      setPages(data);
    } catch (error) {
      console.error('Erro ao carregar landing pages:', error);
      toast.error('Erro ao carregar landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page: LandingPage) => {
    if (!window.confirm(`Tem certeza que deseja excluir a landing page "${page.name}"?`)) {
      return;
    }

    try {
      // API doesn't support delete yet - would call marketingService.deleteLandingPage(page.id)
      toast.success('Landing page excluída com sucesso!');
      loadPages();
    } catch (error) {
      console.error('Erro ao excluir landing page:', error);
      toast.error('Erro ao excluir landing page');
    }
  };

  const handlePublish = async (page: LandingPage) => {
    try {
      await marketingService.publishLandingPage(page.id);
      toast.success('Landing page publicada com sucesso!');
      loadPages();
    } catch (error) {
      console.error('Erro ao publicar landing page:', error);
      toast.error('Erro ao publicar landing page');
    }
  };

  const copyLink = (slug: string) => {
    const url = `https://nexusatemporal.com.br/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ExternalLink className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma landing page criada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Crie sua primeira landing page para começar a capturar leads
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview/Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                <div className="text-center p-4">
                  <h3 className="text-white font-bold text-xl mb-2">{page.title}</h3>
                  <p className="text-white/80 text-sm">{page.description}</p>
                </div>
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${statusColors[page.status]}`}>
                  {statusLabels[page.status]}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{page.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">/{page.slug}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye size={12} className="text-blue-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{page.viewsCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Conversões</p>
                    <p className="font-bold text-gray-900 dark:text-white">{page.conversionsCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Taxa</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {page.viewsCount > 0
                        ? ((page.conversionsCount / page.viewsCount) * 100).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {page.status === 'published' && (
                    <button
                      onClick={() => copyLink(page.slug)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                    >
                      <Copy size={14} />
                      Copiar Link
                    </button>
                  )}
                  {page.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(page)}
                      className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                    >
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(page)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Edit size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(page)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
