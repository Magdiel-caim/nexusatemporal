import React, { useState, useEffect } from 'react';
import { QrCode, Loader, CheckCircle, XCircle, RefreshCw, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Socket } from 'socket.io-client';

interface WhatsAppConnectionPanelProps {
  socket: Socket | null;
  onConnectionSuccess?: () => void;
}

type ConnectionStatus = 'idle' | 'creating' | 'starting' | 'qr_ready' | 'connecting' | 'connected' | 'failed';

const WhatsAppConnectionPanel: React.FC<WhatsAppConnectionPanelProps> = ({ socket, onConnectionSuccess }) => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [sessionName, setSessionName] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [currentSessionName, setCurrentSessionName] = useState<string | null>(null);
  const [connectedSessions, setConnectedSessions] = useState<any[]>([]);

  // Carregar sessões conectadas ao montar
  useEffect(() => {
    loadConnectedSessions();
  }, []);

  // Listen para atualizações de status via WebSocket
  useEffect(() => {
    if (!socket) return;

    socket.on('whatsapp:status', (data: { sessionName: string; status: string }) => {
      console.log('WhatsApp status update:', data);

      if (data.sessionName === currentSessionName) {
        if (data.status === 'WORKING') {
          setStatus('connected');
          toast.success('WhatsApp conectado com sucesso!');
          loadConnectedSessions();
          if (onConnectionSuccess) {
            onConnectionSuccess();
          }
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          toast.error('Falha ao conectar WhatsApp');
        } else if (data.status === 'SCAN_QR_CODE') {
          setStatus('qr_ready');
        }
      }
    });

    return () => {
      socket.off('whatsapp:status');
    };
  }, [socket, currentSessionName, onConnectionSuccess]);

  const loadConnectedSessions = async () => {
    try {
      const { data } = await api.get('/chat/whatsapp/sessions');
      setConnectedSessions(data.sessions.filter((s: any) => s.status === 'WORKING'));
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Digite um nome para a conexão');
      return;
    }

    // Validar nome (apenas letras, números e underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(sessionName)) {
      toast.error('Use apenas letras, números e underscores');
      return;
    }

    try {
      setStatus('creating');

      // Criar sessão
      const { data: createData } = await api.post('/chat/whatsapp/sessions/create', {
        sessionName: sessionName.toLowerCase(),
      });

      console.log('Session created:', createData);
      setCurrentSessionName(sessionName.toLowerCase());
      setStatus('starting');

      // Iniciar sessão e obter QR Code
      const { data: startData } = await api.post(
        `/chat/whatsapp/sessions/${sessionName.toLowerCase()}/start`
      );

      console.log('Session started:', startData);

      if (startData.qrCode) {
        setQrCodeData(startData.qrCode.value);
        setStatus('qr_ready');
        toast.success('QR Code gerado! Escaneie com seu WhatsApp');

        // Poll para verificar se conectou
        startPollingForConnection(sessionName.toLowerCase());
      } else {
        // Se não veio QR Code, aguardar e tentar obter
        setTimeout(() => fetchQRCode(sessionName.toLowerCase()), 2000);
      }
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar conexão');
      setStatus('failed');
    }
  };

  const fetchQRCode = async (session: string) => {
    try {
      const { data } = await api.get(`/chat/whatsapp/sessions/${session}/qr`);
      if (data.qrCode) {
        setQrCodeData(data.qrCode.value);
        setStatus('qr_ready');
        startPollingForConnection(session);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      // Tentar novamente em 2 segundos
      setTimeout(() => fetchQRCode(session), 2000);
    }
  };

  const startPollingForConnection = (session: string) => {
    const checkStatus = async () => {
      try {
        const { data } = await api.get(`/chat/whatsapp/sessions/${session}/status`);

        if (data.session.status === 'WORKING') {
          setStatus('connected');
          toast.success('WhatsApp conectado com sucesso!');
          loadConnectedSessions();
          if (onConnectionSuccess) {
            onConnectionSuccess();
          }
          return;
        } else if (data.session.status === 'FAILED') {
          setStatus('failed');
          toast.error('Falha ao conectar');
          return;
        }

        // Continuar verificando
        setTimeout(checkStatus, 3000);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
  };

  const handleReset = () => {
    setStatus('idle');
    setSessionName('');
    setQrCodeData(null);
    setCurrentSessionName(null);
  };

  const handleDisconnect = async (session: any) => {
    try {
      await api.post(`/chat/whatsapp/sessions/${session.name}/logout`);
      toast.success('Desconectado com sucesso');
      loadConnectedSessions();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="h-8 w-8 text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conectar WhatsApp</h2>
          <p className="text-sm text-gray-600">Conecte seu número do WhatsApp ao sistema</p>
        </div>
      </div>

      {/* Sessões Conectadas */}
      {connectedSessions.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Conexões Ativas
          </h3>
          {connectedSessions.map((session) => (
            <div key={session.name} className="flex items-center justify-between py-2">
              <span className="text-green-700 font-medium">{session.name}</span>
              <button
                onClick={() => handleDisconnect(session)}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Desconectar
              </button>
            </div>
          ))}
        </div>
      )}

      {status === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Conexão
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ex: whatsapp_comercial"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use apenas letras, números e underscores (_)
            </p>
          </div>

          <button
            onClick={handleCreateSession}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <Smartphone className="h-5 w-5" />
            Conectar WhatsApp
          </button>
        </div>
      )}

      {(status === 'creating' || status === 'starting') && (
        <div className="text-center py-12">
          <Loader className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">
            {status === 'creating' ? 'Criando conexão...' : 'Gerando QR Code...'}
          </p>
        </div>
      )}

      {status === 'qr_ready' && qrCodeData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <QrCode className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">QR Code Gerado!</h3>
            <p className="text-sm text-green-700">Escaneie com seu WhatsApp para conectar</p>
          </div>

          <div className="bg-white border-4 border-green-500 rounded-lg p-4 flex justify-center">
            <img
              src={qrCodeData}
              alt="QR Code WhatsApp"
              className="max-w-xs w-full"
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Como conectar:</strong>
            </p>
            <ol className="text-sm text-gray-600 text-left space-y-1 max-w-md mx-auto">
              <li>1. Abra o WhatsApp no seu celular</li>
              <li>2. Toque em <strong>Configurações</strong> {'>'} <strong>Aparelhos conectados</strong></li>
              <li>3. Toque em <strong>Conectar um aparelho</strong></li>
              <li>4. Aponte a câmera para este QR Code</li>
            </ol>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      )}

      {status === 'connected' && (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Conectado com Sucesso!</h3>
          <p className="text-gray-600 mb-6">Seu WhatsApp está conectado e pronto para usar</p>
          <button
            onClick={handleReset}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Nova Conexão
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Falha na Conexão</h3>
          <p className="text-gray-600 mb-6">Não foi possível conectar seu WhatsApp</p>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="h-5 w-5" />
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppConnectionPanel;
