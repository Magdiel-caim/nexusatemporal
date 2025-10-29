import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Filter,
  Trash2,
  ZoomIn,
  Download,
} from 'lucide-react';
import pacienteService, { PatientImage } from '../../services/pacienteService';

interface ImagensTabProps {
  patientId: string;
}

type ImageType = 'all' | 'profile' | 'before' | 'after' | 'document' | 'procedure';

export default function ImagensTab({ patientId }: ImagensTabProps) {
  const [images, setImages] = useState<PatientImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<PatientImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ImageType>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PatientImage | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadData, setUploadData] = useState({
    type: 'document' as PatientImage['type'],
    category: '',
    description: '',
    procedureName: '',
  });

  useEffect(() => {
    loadImages();
  }, [patientId]);

  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.type === typeFilter));
    }
  }, [images, typeFilter]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await pacienteService.getImages(patientId);
      setImages(data);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB');
        return;
      }

      setUploadFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      alert('Selecione uma imagem');
      return;
    }

    setUploading(true);

    try {
      await pacienteService.uploadImage(patientId, uploadFile, {
        type: uploadData.type,
        category: uploadData.category || undefined,
        description: uploadData.description || undefined,
        procedureName: uploadData.procedureName || undefined,
      });

      await loadImages();
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(error.response?.data?.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    try {
      await pacienteService.deleteImage(patientId, imageId);
      await loadImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      alert('Erro ao excluir imagem');
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPreview('');
    setUploadData({
      type: 'document',
      category: '',
      description: '',
      procedureName: '',
    });
  };

  const getTypeLabel = (type: PatientImage['type']): string => {
    const labels: Record<PatientImage['type'], string> = {
      profile: 'Perfil',
      before: 'Antes',
      after: 'Depois',
      document: 'Documento',
      procedure: 'Procedimento',
    };
    return labels[type];
  };

  const getTypeBadgeColor = (type: PatientImage['type']): string => {
    const colors: Record<PatientImage['type'], string> = {
      profile: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      before: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      after: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      document: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      procedure: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[type];
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (image: PatientImage) => {
    try {
      const link = document.createElement('a');
      link.href = image.signedUrl || image.imageUrl;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando imagens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ImageType)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">Todas ({images.length})</option>
              <option value="profile">Perfil ({images.filter(i => i.type === 'profile').length})</option>
              <option value="before">Antes ({images.filter(i => i.type === 'before').length})</option>
              <option value="after">Depois ({images.filter(i => i.type === 'after').length})</option>
              <option value="document">Documentos ({images.filter(i => i.type === 'document').length})</option>
              <option value="procedure">Procedimentos ({images.filter(i => i.type === 'procedure').length})</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Adicionar Imagem
        </button>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {typeFilter === 'all' ? 'Nenhuma imagem cadastrada' : `Nenhuma imagem do tipo "${getTypeLabel(typeFilter)}"`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Clique em "Adicionar Imagem" para fazer upload
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                <img
                  src={image.signedUrl || image.imageUrl}
                  alt={image.description || image.filename}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Ver em tamanho real"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-900" />
                  </button>
                  <button
                    onClick={() => handleDownload(image)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-5 h-5 text-gray-900" />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadgeColor(image.type)}`}>
                    {getTypeLabel(image.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(image.createdAt)}
                  </span>
                </div>

                {image.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 line-clamp-2">
                    {image.description}
                  </p>
                )}

                {image.procedureName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Procedimento: {image.procedureName}
                  </p>
                )}

                {image.category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Categoria: {image.category}
                  </p>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatFileSize(image.fileSize)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Adicionar Imagem
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Arquivo <span className="text-red-500">*</span>
                  </label>

                  {uploadPreview ? (
                    <div className="relative">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Clique para selecionar ou arraste a imagem
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          JPG, PNG, GIF até 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value as PatientImage['type'] }))}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="document">Documento</option>
                    <option value="before">Antes</option>
                    <option value="after">Depois</option>
                    <option value="procedure">Procedimento</option>
                    <option value="profile">Perfil</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <input
                    type="text"
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Ex: RG, CPF, Contrato, etc"
                  />
                </div>

                {/* Procedure Name (if type is procedure) */}
                {uploadData.type === 'procedure' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Procedimento</label>
                    <input
                      type="text"
                      value={uploadData.procedureName}
                      onChange={(e) => setUploadData(prev => ({ ...prev, procedureName: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Ex: Botox, Preenchimento, etc"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Descrição ou observações sobre a imagem"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          <div className="max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.signedUrl || selectedImage.imageUrl}
              alt={selectedImage.description || selectedImage.filename}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {selectedImage.description && (
              <p className="text-white text-center mt-4 px-4">
                {selectedImage.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
