import { useState, useEffect } from 'react';
import { SocialPost, marketingService } from '@/services/marketingService';
import { Edit, Trash2, Calendar, Clock, Image as ImageIcon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SocialPostListProps {
  onEdit: (post: SocialPost) => void;
  refreshTrigger?: number;
}

const platformIcons: Record<string, string> = {
  instagram: '📷',
  facebook: '👍',
  linkedin: '💼',
  tiktok: '🎵',
};

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-black',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
};

export default function SocialPostList({ onEdit, refreshTrigger }: SocialPostListProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.platform !== 'all') filterParams.platform = filters.platform;
      if (filters.status !== 'all') filterParams.status = filters.status;

      const data = await marketingService.getSocialPosts(filterParams);
      setPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filters]);

  const handleDelete = async (post: SocialPost) => {
    if (!window.confirm(`Tem certeza que deseja excluir este post para ${post.platform}?`)) {
      return;
    }

    try {
      await marketingService.deleteSocialPost(post.id);
      toast.success('Post excluído com sucesso!');
      loadPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filters.platform !== 'all' && post.platform !== filters.platform) return false;
    if (filters.status !== 'all' && post.status !== filters.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plataforma
          </label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">Todas</option>
            <option value="instagram">📷 Instagram</option>
            <option value="facebook">👍 Facebook</option>
            <option value="linkedin">💼 LinkedIn</option>
            <option value="tiktok">🎵 TikTok</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="scheduled">Agendado</option>
            <option value="published">Publicado</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        <div className="ml-auto flex items-end">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrado
            {filteredPosts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.length === 0
              ? 'Crie seu primeiro post para redes sociais'
              : 'Nenhum post corresponde aos filtros selecionados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Platform Header */}
              <div className={`${platformColors[post.platform]} text-white px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{platformIcons[post.platform]}</span>
                    <div>
                      <p className="font-semibold capitalize">{post.platform}</p>
                      <p className="text-xs opacity-80 capitalize">{post.postType}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status]}`}
                  >
                    {statusLabels[post.status]}
                  </span>
                </div>
              </div>

              {/* Media Preview */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="relative">
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                  />
                  {post.mediaUrls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      +{post.mediaUrls.length - 1}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-900 dark:text-white text-sm line-clamp-3 mb-4">
                  {post.content}
                </p>

                {/* Schedule Info */}
                {post.scheduledAt && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(post.scheduledAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {format(new Date(post.scheduledAt), 'HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                )}

                {post.publishedAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <ExternalLink size={14} />
                    Publicado em {format(new Date(post.publishedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                )}

                {/* Metrics (if published) */}
                {post.status === 'published' && post.metrics && (
                  <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {post.metrics.likes || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Curtidas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {post.metrics.comments || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Comentários</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {post.metrics.shares || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Compartilh.</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(post)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 size={16} />
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
