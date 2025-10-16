import React, { useRef } from 'react';
import { Image, Paperclip, Video, FileText, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaUploadButtonProps {
  type: 'image' | 'video' | 'document' | 'any';
  onFileSelect: (file: File, preview?: string) => void;
  disabled?: boolean;
}

const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ type, onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar';
      case 'any':
        return '*/*';
      default:
        return '*/*';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'any':
        return <Paperclip className="h-5 w-5" />;
      default:
        return <Paperclip className="h-5 w-5" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máx 16MB)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 16MB');
      return;
    }

    // Gerar preview para imagens e vídeos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onFileSelect(file, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelect(file);
    }

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={`Enviar ${type === 'any' ? 'arquivo' : type === 'image' ? 'imagem' : type === 'video' ? 'vídeo' : 'documento'}`}
      >
        {getIcon()}
      </button>
    </>
  );
};

export default MediaUploadButton;

// Preview Component
interface MediaPreviewProps {
  file: File;
  preview?: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  preview,
  caption,
  onCaptionChange,
  onSend,
  onCancel,
}) => {
  const renderPreview = () => {
    if (file.type.startsWith('image/') && preview) {
      return (
        <img
          src={preview}
          alt="Preview"
          className="max-w-full max-h-96 rounded-lg object-contain"
        />
      );
    }

    if (file.type.startsWith('video/') && preview) {
      return (
        <video
          src={preview}
          controls
          className="max-w-full max-h-96 rounded-lg object-contain"
        />
      );
    }

    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
        <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Enviar Arquivo</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          {renderPreview()}
        </div>

        {/* Caption Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Adicione uma legenda..."
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              onKeyDown={(e) => {
                console.log('🔑 Tecla pressionada no modal:', e.key);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  console.log('✅ Enter detectado - enviando mídia');
                  onSend();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={onSend}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
