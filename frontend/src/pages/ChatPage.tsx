import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Tag as TagIcon,
  User,
  X,
  Image as ImageIcon,
  Smartphone,
} from 'lucide-react';
import chatService, { Conversation, Message, QuickReply } from '../services/chatService';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';
import WhatsAppConnectionPanel from '../components/chat/WhatsAppConnectionPanel';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showWhatsAppConnection, setShowWhatsAppConnection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket
  useEffect(() => {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
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

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
  }, [searchQuery, filterStatus]);

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
      const data = await chatService.getConversations({
        search: searchQuery,
        status: filterStatus,
      });
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Erro ao carregar conversas');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
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
      await chatService.markAsRead(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const newMessage = await chatService.sendMessage(selectedConversation.id, {
        type: 'text',
        content: messageInput,
      });

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insertQuickReply = (reply: QuickReply) => {
    setMessageInput(reply.content);
    setShowQuickReplies(false);
  };

  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const formatConversationTime = (date?: string) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery && !conv.contactName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus && conv.status !== filterStatus) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Modal de Conexão WhatsApp */}
      {showWhatsAppConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Conectar WhatsApp</h2>
              <button
                onClick={() => setShowWhatsAppConnection(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
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
              />
            </div>
          </div>
        </div>
      )}

      <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Conversations List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-3">Chat</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === '' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFilterStatus('waiting')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filterStatus === 'waiting' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Aguardando
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

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
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
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.contactName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatConversationTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessagePreview}</p>

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
            <div className="text-center py-12 text-gray-500">
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Panel - Messages */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{selectedConversation.contactName}</h2>
                <p className="text-sm text-gray-500">{selectedConversation.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Carregando mensagens...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outgoing'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.content && <p className="text-sm">{message.content}</p>}

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-75">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {message.direction === 'outgoing' && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Replies Panel */}
          {showQuickReplies && (
            <div className="border-t border-gray-200 bg-white p-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Respostas Rápidas</h3>
                <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.slice(0, 6).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => insertQuickReply(reply)}
                    className="text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg truncate"
                  >
                    {reply.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Respostas Rápidas"
              >
                <TagIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ImageIcon className="h-5 w-5 text-gray-600" />
              </button>

              <input
                type="text"
                placeholder="Digite uma mensagem..."
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="h-5 w-5 text-gray-600" />
              </button>

              {messageInput.trim() ? (
                <button
                  onClick={sendMessage}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Mic className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Selecione uma conversa</h2>
            <p className="text-gray-500">Escolha uma conversa para começar a conversar</p>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ChatPage;
