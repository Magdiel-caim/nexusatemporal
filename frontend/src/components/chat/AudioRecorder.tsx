import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, X, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Tentar usar OGG/Opus (melhor compatibilidade com WhatsApp)
      let mimeType = 'audio/ogg;codecs=opus';
      let options: MediaRecorderOptions = { mimeType };

      // Fallback para webm se OGG não for suportado
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn('OGG não suportado, usando WebM');
        mimeType = 'audio/webm';
        options = { mimeType };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowRecordingModal(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Não foi possível acessar o microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setShowRecordingModal(false);
  };

  const sendAudio = () => {
    if (audioBlob) {
      onAudioReady(audioBlob);
      cancelRecording();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Recording Button */}
      <button
        onClick={startRecording}
        disabled={disabled || isRecording}
        className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Gravar áudio"
      >
        <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
      </button>

      {/* Recording Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isRecording ? 'Gravando Áudio' : 'Pré-visualizar Áudio'}
              </h3>
              <button
                onClick={cancelRecording}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Recording State */}
            {isRecording && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isPaused ? 'Gravação pausada' : 'Gravando...'}
                </p>
              </div>
            )}

            {/* Audio Preview */}
            {audioBlob && !isRecording && (
              <div className="mb-6">
                <audio
                  ref={audioRef}
                  src={audioUrl || ''}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Áudio gravado</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {isRecording && (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full"
                      title="Continuar gravação"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                      title="Pausar gravação"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full"
                    title="Parar gravação"
                  >
                    <Square className="h-5 w-5" />
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={cancelRecording}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Descartar
                  </button>
                  <button
                    onClick={sendAudio}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Enviar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioRecorder;
