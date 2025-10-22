import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Image as ImageIcon, Calendar, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { SocialPost, marketingService } from '@/services/marketingService';
import * as Dialog from '@radix-ui/react-dialog';

const socialPostSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'tiktok']),
  postType: z.enum(['feed', 'story', 'reel', 'carousel']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  campaignId: z.string().optional(),
});

type SocialPostFormData = z.infer<typeof socialPostSchema>;

interface SocialPostFormProps {
  post?: SocialPost;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function SocialPostForm({ post, isOpen, onClose, onSuccess }: SocialPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>(post?.mediaUrls || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SocialPostFormData>({
    resolver: zodResolver(socialPostSchema),
    defaultValues: post
      ? {
          platform: post.platform,
          postType: post.postType,
          content: post.content,
          scheduledDate: post.scheduledAt ? new Date(post.scheduledAt).toISOString().split('T')[0] : '',
          scheduledTime: post.scheduledAt
            ? new Date(post.scheduledAt).toTimeString().split(' ')[0].substring(0, 5)
            : '',
          campaignId: post.campaignId || '',
        }
      : {
          platform: 'instagram',
          postType: 'feed',
          content: '',
          scheduledDate: '',
          scheduledTime: '',
          campaignId: '',
        },
  });

  const selectedPlatform = watch('platform');
  const selectedPostType = watch('postType');
  const content = watch('content');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: selectedPostType === 'carousel' ? 10 : 1,
    onDrop: (acceptedFiles) => {
      const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
      setMediaPreviews(previews);
    },
  });

  const onSubmit = async (data: SocialPostFormData) => {
    try {
      setLoading(true);

      let scheduledAt: string | undefined;
      if (data.scheduledDate && data.scheduledTime) {
        scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString();
      }

      const postData = {
        platform: data.platform,
        postType: data.postType,
        content: data.content,
        mediaUrls: mediaPreviews, // Em produção, fazer upload primeiro
        scheduledAt,
        campaignId: data.campaignId || undefined,
        status: scheduledAt ? ('scheduled' as const) : ('draft' as const),
      };

      if (post) {
        await marketingService.updateSocialPost(post.id, postData);
        toast.success('Post atualizado com sucesso!');
      } else {
        await marketingService.createSocialPost(postData);
        toast.success('Post criado com sucesso!');
      }

      reset();
      setMediaPreviews([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setMediaPreviews([]);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
              {post ? 'Editar Post' : 'Novo Post para Redes Sociais'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Plataforma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataforma *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['instagram', 'facebook', 'linkedin', 'tiktok'] as const).map((platform) => (
                      <label
                        key={platform}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPlatform === platform
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input type="radio" value={platform} {...register('platform')} className="sr-only" />
                        <span className="text-2xl">{platformIcons[platform]}</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {platform}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.platform && (
                    <p className="text-sm text-red-600 mt-1">{errors.platform.message}</p>
                  )}
                </div>

                {/* Tipo de Post */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Post *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['feed', 'story', 'reel', 'carousel'] as const).map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPostType === type
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input type="radio" value={type} {...register('postType')} className="sr-only" />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.postType && (
                    <p className="text-sm text-red-600 mt-1">{errors.postType.message}</p>
                  )}
                </div>

                {/* Conteúdo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                    placeholder="Escreva o conteúdo do seu post aqui..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {content?.length || 0} caracteres
                    </p>
                  </div>
                </div>

                {/* Upload de Mídia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mídia {selectedPostType === 'carousel' ? '(até 10 arquivos)' : ''}
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isDragActive
                        ? 'Solte os arquivos aqui...'
                        : 'Arraste arquivos ou clique para selecionar'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Imagens (PNG, JPG, GIF) ou vídeos (MP4, MOV)
                    </p>
                  </div>

                  {/* Previews */}
                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agendamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline mr-1" size={16} />
                      Data de Agendamento
                    </label>
                    <input
                      type="date"
                      {...register('scheduledDate')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="inline mr-1" size={16} />
                      Horário
                    </label>
                    <input
                      type="time"
                      {...register('scheduledTime')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview do Post
                </label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  {/* Platform Header */}
                  <div className={`${platformColors[selectedPlatform]} text-white px-4 py-2 rounded-t-lg -mx-4 -mt-4 mb-4`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{platformIcons[selectedPlatform]}</span>
                      <div>
                        <p className="font-semibold">Sua Empresa</p>
                        <p className="text-xs opacity-80 capitalize">{selectedPostType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Media Preview */}
                  {mediaPreviews.length > 0 && (
                    <div className="mb-4">
                      {mediaPreviews.length === 1 ? (
                        <img
                          src={mediaPreviews[0]}
                          alt="Preview"
                          className="w-full rounded-lg"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {mediaPreviews.slice(0, 4).map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                          {mediaPreviews.length > 4 && (
                            <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400">
                              +{mediaPreviews.length - 4} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {content || (
                      <p className="text-gray-400 dark:text-gray-500 italic">
                        O conteúdo do post aparecerá aqui...
                      </p>
                    )}
                  </div>

                  {/* Empty state */}
                  {!content && mediaPreviews.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <ImageIcon className="mx-auto h-16 w-16 mb-2 opacity-50" />
                      <p className="text-sm">Adicione conteúdo e mídia para ver o preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Salvando...' : post ? 'Atualizar Post' : 'Criar Post'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
