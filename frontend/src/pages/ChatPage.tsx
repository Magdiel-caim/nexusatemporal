import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Tag as TagIcon,
  User,
  X,
  Smartphone,
  Zap,
  Settings,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import chatService, { Conversation, Message, QuickReply } from '../services/chatService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';
import WhatsAppConnectionPanel from '../components/chat/WhatsAppConnectionPanel';
import MessageBubble from '../components/chat/MessageBubble';
import MediaUploadButton, { MediaPreview } from '../components/chat/MediaUploadButton';
import AudioRecorder from '../components/chat/AudioRecorder';
import EmojiPicker from 'emoji-picker-react';
import ChannelSelector from '../components/chat/ChannelSelector';
import ConversationDetailsPanel from '../components/chat/ConversationDetailsPanel';
import QuickReplyManager from '../components/chat/QuickReplyManager';
import TypingIndicator from '../components/chat/TypingIndicator';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterChatType, setFilterChatType] = useState<string>(''); // '' | 'individual' | 'group'
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null); // Filtro por canal/sessão
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplyManager, setShowQuickReplyManager] = useState(false);
  const [quickReplySuggestions, setQuickReplySuggestions] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showWhatsAppConnection, setShowWhatsAppConnection] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileCaption, setFileCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [showRightPanel, setShowRightPanel] = useState(true); // Toggle painel direito
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    // Detectar automaticamente se está em localhost ou produção
    const apiUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:3001'
      : 'https://api.nexusatemporal.com.br';

    console.log('🔌 Conectando WebSocket em:', apiUrl);

    const socketInstance = io(apiUrl, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      const userId = localStorage.getItem('userId');
      if (userId) {
        socketInstance.emit('auth', { userId, token: localStorage.getItem('token') });
      }
    });

    socketInstance.on('message:new', (message: Message) => {
      console.log('New message received:', message);
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      // Update conversation list
      loadConversations();
    });

    socketInstance.on('conversation:newMessage', (data) => {
      console.log('New conversation message:', data);
      loadConversations();
    });

    // Listen para mensagens WhatsApp vindas do WAHA via backend
    socketInstance.on('chat:new-message', (whatsappMessage: any) => {
      console.log('📱 Nova mensagem WhatsApp recebida via WebSocket:', whatsappMessage);

      // Atualizar lista de conversas SEMPRE
      loadConversations();

      // IMPORTANTE: Ignorar mensagens OUTGOING do WebSocket (já foram adicionadas localmente ao enviar)
      if (whatsappMessage.direction === 'outgoing') {
        console.log('⏭️ Mensagem outgoing ignorada (já adicionada localmente)');
        return;
      }

      // Se estiver na conversa, adicionar mensagem (usando ref ao invés de closure)
      const currentConversation = selectedConversationRef.current;
      if (currentConversation) {
        console.log('📋 Conversa selecionada:', {
          id: currentConversation.id,
          phoneNumber: currentConversation.phoneNumber,
          whatsappInstanceId: currentConversation.whatsappInstanceId
        });
        console.log('📨 Mensagem recebida de:', whatsappMessage.phoneNumber);

        // Verificar se a mensagem é da conversa atual
        if (currentConversation.phoneNumber === whatsappMessage.phoneNumber &&
            currentConversation.whatsappInstanceId === whatsappMessage.sessionName) {
          console.log('✅ Mensagem pertence à conversa atual - adicionando à lista');
          const newMessage: Message = {
            id: whatsappMessage.id,
            conversationId: currentConversation.id,
            content: whatsappMessage.content,
            mediaUrl: whatsappMessage.mediaUrl,
            direction: whatsappMessage.direction,
            type: whatsappMessage.messageType || 'text',
            status: 'delivered',
            createdAt: whatsappMessage.createdAt,
          };
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        } else {
          console.log('⏭️ Mensagem de outra conversa - exibindo toast');
          toast.success(`Nova mensagem de ${whatsappMessage.contactName || whatsappMessage.phoneNumber}`);
        }
      } else {
        console.log('⏭️ Nenhuma conversa selecionada - exibindo toast');
        toast.success(`Nova mensagem de ${whatsappMessage.contactName || whatsappMessage.phoneNumber}`);
      }
    });

    // Listen para mensagens deletadas no WhatsApp
    socketInstance.on('chat:message-deleted', (deletedData: any) => {
      console.log('🗑️ Mensagem deletada no WhatsApp:', deletedData);

      // Atualizar lista de conversas
      loadConversations();

      // Se estiver na conversa, remover mensagem da UI (usando ref)
      const currentConversation = selectedConversationRef.current;
      if (currentConversation) {
        if (currentConversation.phoneNumber === deletedData.phoneNumber &&
            currentConversation.whatsappInstanceId === deletedData.sessionName) {
          console.log('✅ Removendo mensagem da conversa atual:', deletedData.messageId);
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedData.messageId));
          toast.success('Mensagem deletada no WhatsApp');
        }
      }
    });

    // Listen para typing indicators
    socketInstance.on('typing:start', (data: { conversationId: string; userName: string }) => {
      const currentConversation = selectedConversationRef.current;
      if (currentConversation && currentConversation.id === data.conversationId) {
        setIsTyping(true);
        setTypingUser(data.userName || 'Alguém');
      }
    });

    socketInstance.on('typing:stop', (data: { conversationId: string }) => {
      const currentConversation = selectedConversationRef.current;
      if (currentConversation && currentConversation.id === data.conversationId) {
        setIsTyping(false);
        setTypingUser('');
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('chat:new-message');
      socketInstance.off('chat:message-deleted');
      socketInstance.disconnect();
    };
  }, []); // WebSocket conecta UMA VEZ e não reconecta

  // Update ref when conversation changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Join conversation room when selected
  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('conversation:join', { conversationId: selectedConversation.id });

      return () => {
        socket.emit('conversation:leave', { conversationId: selectedConversation.id });
      };
    }
  }, [socket, selectedConversation]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [searchQuery, filterStatus, filterChatType]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Load quick replies
  useEffect(() => {
    loadQuickReplies();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      // Carregar conversas normais
      const normalConversations = await chatService.getConversations({
        search: searchQuery,
        status: filterStatus,
      });

      // Carregar conversas WhatsApp do endpoint N8N
      let whatsappConversations: Conversation[] = [];
      try {
        const whatsappData = await chatService.getWhatsAppConversations();

        // Garantir que whatsappData seja um array
        const whatsappArray = Array.isArray(whatsappData) ? whatsappData : [];

        // Converter conversas WhatsApp para o formato Conversation
        whatsappConversations = whatsappArray.map((conv: any) => ({
          id: `whatsapp-${conv.sessionName}-${conv.phoneNumber}`, // Usar hífen ao invés de underscore
          contactName: conv.contactName || conv.phoneNumber,
          phoneNumber: conv.phoneNumber,
          whatsappInstanceId: conv.sessionName,
          chatType: conv.chatType || 'individual', // 'individual' ou 'group'
          status: 'active' as const,
          isUnread: (conv.unreadCount || 0) > 0,
          unreadCount: conv.unreadCount || 0,
          lastMessageAt: conv.lastMessageAt,
          lastMessagePreview: conv.lastMessage,
          createdAt: conv.lastMessageAt || new Date().toISOString(),
          updatedAt: conv.lastMessageAt || new Date().toISOString(),
        }));
      } catch (whatsappError) {
        console.log('WhatsApp conversations not available:', whatsappError);
      }

      // Mesclar e ordenar por última mensagem
      const allConversations = [...normalConversations, ...whatsappConversations]
        .sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA; // Mais recente primeiro
        });

      setConversations(allConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Erro ao carregar conversas');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('🚀 INICIANDO loadMessages para:', conversationId);
      setIsLoading(true);

      // Se for conversa WhatsApp, buscar do endpoint WhatsApp
      if (conversationId.startsWith('whatsapp-')) {
        console.log('✅ É conversa WhatsApp - buscando mensagens...');
        // Usar dados do selectedConversation ao invés de fazer parse
        if (!selectedConversation) return;

        const sessionName = selectedConversation.whatsappInstanceId;
        const phoneNumber = selectedConversation.phoneNumber;

        console.log('🔍 Buscando mensagens:', { sessionName, phoneNumber });

        const whatsappMessages = await chatService.getWhatsAppMessages(sessionName!, phoneNumber);

        // Garantir que whatsappMessages seja um array
        const messagesArray = Array.isArray(whatsappMessages) ? whatsappMessages : [];

        console.log('📨 Total de mensagens recebidas:', messagesArray.length);

        // Converter para formato Message
        const messages: Message[] = messagesArray.map((msg: any) => {
          // DEBUG: Log completo da mensagem
          console.log('🔍 Processando mensagem:', {
            id: msg.id,
            type: msg.messageType,
            hasMediaUrl: !!msg.mediaUrl,
            mediaUrl: msg.mediaUrl,
            isBase64: msg.mediaUrl ? msg.mediaUrl.startsWith('data:') : false,
          });

          return {
            id: msg.id,
            conversationId: conversationId,
            direction: msg.direction,
            type: msg.messageType || 'text',
            content: msg.content,
            mediaUrl: msg.mediaUrl,
            status: msg.status || 'delivered',
            createdAt: msg.createdAt,
          };
        });

        setMessages(messages);
      } else {
        // Conversa normal
        const data = await chatService.getMessages(conversationId);
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickReplies = async () => {
    try {
      const data = await chatService.getQuickReplies();
      setQuickReplies(data);
    } catch (error) {
      console.error('Error loading quick replies:', error);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      // Se for conversa WhatsApp, usar endpoint específico
      if (conversationId.startsWith('whatsapp-')) {
        if (!selectedConversation) return;

        const sessionName = selectedConversation.whatsappInstanceId;
        const phoneNumber = selectedConversation.phoneNumber;

        console.log('✅ Marcando como lido:', { sessionName, phoneNumber });

        await chatService.markWhatsAppAsRead(sessionName!, phoneNumber);
      } else {
        await chatService.markAsRead(conversationId);
      }

      // Recarregar conversas para atualizar contador
      loadConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    console.log('🚀 FUNÇÃO sendMessage CHAMADA!', {
      messageInput: messageInput,
      hasConversation: !!selectedConversation,
    });

    if (!messageInput.trim() || !selectedConversation) {
      console.log('❌ BLOQUEADO - Mensagem vazia ou sem conversa');
      return;
    }

    try {
      let newMessage: Message;

      // DEBUG - Verificar conversa
      console.log('🔍 DEBUG - Conversa selecionada:', {
        id: selectedConversation.id,
        phoneNumber: selectedConversation.phoneNumber,
        whatsappInstanceId: selectedConversation.whatsappInstanceId,
        startsWithWhatsapp: selectedConversation.id.startsWith('whatsapp-'),
      });

      // FORÇAR WhatsApp se tiver phoneNumber no padrão brasileiro (começa com 55)
      const isWhatsApp = selectedConversation.whatsappInstanceId ||
                         selectedConversation.id.startsWith('whatsapp-') ||
                         (selectedConversation.phoneNumber && selectedConversation.phoneNumber.startsWith('55'));

      if (isWhatsApp && selectedConversation.phoneNumber) {
        console.log('📤 Enviando mensagem WhatsApp:', {
          session: selectedConversation.whatsappInstanceId,
          phone: selectedConversation.phoneNumber,
          content: messageInput,
        });

        // Se não tiver whatsappInstanceId, usar um padrão
        const sessionName = selectedConversation.whatsappInstanceId || 'session_01k77wpm5edhch4b97qbgenk7p';

        // Enviar via WhatsApp
        newMessage = await chatService.sendWhatsAppMessage(
          sessionName,
          selectedConversation.phoneNumber,
          messageInput
        );
      } else {
        console.log('📧 Enviando mensagem normal (não WhatsApp)');
        // Conversa normal
        newMessage = await chatService.sendMessage(selectedConversation.id, {
          type: 'text',
          content: messageInput,
        });
      }

      setMessages((prev) => [...prev, newMessage]);
      setMessageInput('');
      scrollToBottom();

      // Emit typing stop
      if (socket) {
        socket.emit('typing:stop', {
          conversationId: selectedConversation.id,
          userId: localStorage.getItem('userId'),
        });
      }

      toast.success('Mensagem enviada');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing:start', {
        conversationId: selectedConversation.id,
        userId: localStorage.getItem('userId'),
        userName: 'Você',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Se houver mídia selecionada, enviar mídia; senão, enviar mensagem de texto
      if (selectedFile) {
        handleSendFile();
      } else {
        sendMessage();
      }
    }
  };

  const insertQuickReply = (reply: QuickReply) => {
    setMessageInput(reply.content);
    setShowQuickReplies(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Deseja realmente excluir esta mensagem?')) {
      return;
    }

    try {
      await chatService.deleteWhatsAppMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success('Mensagem excluída com sucesso');
      loadConversations(); // Atualizar lista de conversas
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  // Handler para seleção de arquivo
  const handleFileSelect = async (file: File, preview?: string) => {
    setSelectedFile(file);
    setFilePreview(preview || null);
  };

  // Handler para envio de arquivo
  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation) return;

    try {
      // Converter arquivo para base64
      const base64 = await chatService.fileToBase64(selectedFile);

      // Determinar tipo de mídia
      let messageType: 'image' | 'video' | 'audio' | 'document' = 'document';
      if (selectedFile.type.startsWith('image/')) messageType = 'image';
      else if (selectedFile.type.startsWith('video/')) messageType = 'video';
      else if (selectedFile.type.startsWith('audio/')) messageType = 'audio';

      const sessionName = selectedConversation.whatsappInstanceId || 'session_01k77wpm5edhch4b97qbgenk7p';

      // Enviar via WhatsApp
      const newMessage = await chatService.sendWhatsAppMedia(
        sessionName,
        selectedConversation.phoneNumber,
        base64,
        messageType,
        fileCaption || undefined,
        quotedMessage?.id
      );

      setMessages((prev) => [...prev, newMessage]);
      setSelectedFile(null);
      setFilePreview(null);
      setFileCaption('');
      setQuotedMessage(null);
      toast.success('Mídia enviada');
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      toast.error('Erro ao enviar mídia');
    }
  };

  // Handler para áudio gravado
  const handleAudioReady = async (audioBlob: Blob) => {
    if (!selectedConversation) return;

    try {
      // Converter blob para base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      const sessionName = selectedConversation.whatsappInstanceId || 'session_01k77wpm5edhch4b97qbgenk7p';

      // Enviar como 'audio' ao invés de 'ptt' (ptt requer waveform que WAHA não gera)
      const newMessage = await chatService.sendWhatsAppMedia(
        sessionName,
        selectedConversation.phoneNumber,
        base64,
        'audio',
        undefined,
        quotedMessage?.id
      );

      setMessages((prev) => [...prev, newMessage]);
      setQuotedMessage(null);
      toast.success('Áudio enviado');
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      toast.error('Erro ao enviar áudio');
    }
  };

  // Handler para emoji
  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handler para responder mensagem
  const handleReplyMessage = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      setQuotedMessage(msg);
    }
  };

  const formatConversationTime = (date?: string) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery && !conv.contactName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus && conv.status !== filterStatus) {
      return false;
    }
    if (filterChatType && (conv as any).chatType !== filterChatType) {
      return false;
    }
    // Filtrar por canal selecionado
    if (selectedChannel && conv.whatsappInstanceId !== selectedChannel) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Modal de Conexão WhatsApp */}
      {showWhatsAppConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold">Conectar WhatsApp</h2>
              <button
                onClick={() => setShowWhatsAppConnection(false)}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <WhatsAppConnectionPanel
                socket={socket}
                onConnectionSuccess={() => {
                  setShowWhatsAppConnection(false);
                  loadConversations();
                }}
                onClose={() => setShowWhatsAppConnection(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Conversations List */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header - STICKY */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Chat</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Buttons - Status */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === '' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFilterStatus('waiting')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === 'waiting' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Aguardando
            </button>
          </div>

          {/* Filter Buttons - Chat Type */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setFilterChatType('')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterChatType === '' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterChatType('individual')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterChatType === 'individual' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Individuais
            </button>
            <button
              onClick={() => setFilterChatType('group')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterChatType === 'group' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'
              }`}
            >
              Grupos
            </button>
          </div>

          {/* Botão Conectar WhatsApp */}
          <button
            onClick={() => setShowWhatsAppConnection(true)}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Conectar WhatsApp
          </button>
        </div>

        {/* Channel Selector */}
        <ChannelSelector
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 ${
                selectedConversation?.id === conversation.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.contactName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {formatConversationTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 truncate">{conversation.lastMessagePreview}</p>

                  {/* Tags */}
                  {conversation.tags && conversation.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {conversation.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unread badge */}
                {conversation.isUnread && conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Panel - Messages */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{selectedConversation.contactName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{selectedConversation.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg">
                <Video className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
                title={showRightPanel ? 'Ocultar painel lateral' : 'Mostrar painel lateral'}
              >
                {showRightPanel ? (
                  <PanelRightClose className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <PanelRightOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg">
                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">Carregando mensagens...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onReply={handleReplyMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                {isTyping && <TypingIndicator name={typingUser} />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Replies Panel */}
          {showQuickReplies && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Respostas Rápidas</h3>
                <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.slice(0, 6).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => insertQuickReply(reply)}
                    className="text-left p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:bg-gray-700 rounded-lg truncate"
                  >
                    {reply.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Quoted Message Display */}
            {quotedMessage && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 flex items-center justify-between rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Respondendo:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{quotedMessage.content}</p>
                </div>
                <button
                  onClick={() => setQuotedMessage(null)}
                  className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 relative">
              {/* Respostas Rápidas */}
              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
                title="Respostas Rápidas"
              >
                <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>

              {/* Gerenciar Respostas Rápidas */}
              <button
                onClick={() => setShowQuickReplyManager(true)}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
                title="Gerenciar Respostas Rápidas"
              >
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>

              {/* Upload de Documento */}
              <MediaUploadButton
                type="document"
                onFileSelect={handleFileSelect}
              />

              {/* Upload de Imagem */}
              <MediaUploadButton
                type="image"
                onFileSelect={handleFileSelect}
              />

              {/* Upload de Vídeo */}
              <MediaUploadButton
                type="video"
                onFileSelect={handleFileSelect}
              />

              {/* Input de Texto */}
              <input
                type="text"
                placeholder="Digite uma mensagem ou / para respostas rápidas..."
                value={messageInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setMessageInput(value);
                  handleTyping();

                  // Detectar atalho de quick reply (/)
                  if (value.startsWith('/') && value.length > 1) {
                    const search = value.slice(1).toLowerCase();
                    const filtered = quickReplies.filter(qr =>
                      qr.shortcut?.toLowerCase().includes(search) ||
                      qr.title.toLowerCase().includes(search)
                    );
                    setQuickReplySuggestions(filtered.slice(0, 5));
                  } else {
                    setQuickReplySuggestions([]);
                  }
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Reply Suggestions Dropdown */}
              {quickReplySuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                  {quickReplySuggestions.map((qr) => (
                    <button
                      key={qr.id}
                      onClick={() => {
                        setMessageInput(qr.content);
                        setQuickReplySuggestions([]);
                      }}
                      className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                    >
                      <Zap className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{qr.title}</p>
                          {qr.shortcut && (
                            <span className="px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                              {qr.shortcut}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{qr.content}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Picker */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg"
                title="Emojis"
              >
                <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
              </button>

              {/* Enviar ou Gravar Áudio */}
              {messageInput.trim() ? (
                <button
                  onClick={sendMessage}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <AudioRecorder
                  onAudioReady={handleAudioReady}
                />
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Selecione uma conversa</h2>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Escolha uma conversa para começar a conversar</p>
          </div>
        </div>
      )}

      {/* Right Panel - Conversation Details */}
      {selectedConversation && showRightPanel && (
        <ConversationDetailsPanel
          conversation={selectedConversation}
          onUpdate={() => {
            loadConversations();
            if (selectedConversation) {
              loadMessages(selectedConversation.id);
            }
          }}
        />
      )}
      </div>

      {/* Media Preview Modal */}
      {selectedFile && (
        <MediaPreview
          file={selectedFile}
          preview={filePreview || ''}
          caption={fileCaption}
          onCaptionChange={setFileCaption}
          onSend={handleSendFile}
          onCancel={() => {
            setSelectedFile(null);
            setFilePreview(null);
            setFileCaption('');
          }}
        />
      )}

      {/* Quick Reply Manager Modal */}
      {showQuickReplyManager && (
        <QuickReplyManager
          onClose={() => {
            setShowQuickReplyManager(false);
            loadQuickReplies(); // Reload quick replies after changes
          }}
          onSelect={(content) => {
            setMessageInput(content);
          }}
        />
      )}
    </>
  );
};

export default ChatPage;
