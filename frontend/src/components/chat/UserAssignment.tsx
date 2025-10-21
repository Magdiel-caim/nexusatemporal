import React, { useState, useEffect } from 'react';
import { UserPlus, User as UserIcon, Check, ChevronDown } from 'lucide-react';
import chatService from '../../services/chatService';
import { userService, User } from '../../services/userService';
import toast from 'react-hot-toast';

interface UserAssignmentProps {
  conversationId: string;
  assignedUserId?: string;
  onUpdate?: () => void;
}

const UserAssignment: React.FC<UserAssignmentProps> = ({
  conversationId,
  assignedUserId,
  onUpdate,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (assignedUserId && users.length > 0) {
      const user = users.find(u => u.id === assignedUserId);
      setCurrentUser(user || null);
    } else {
      setCurrentUser(null);
    }
  }, [assignedUserId, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      await chatService.assignConversation(conversationId, userId);
      const user = users.find(u => u.id === userId);
      setCurrentUser(user || null);
      toast.success(`Conversa atribuída a ${user?.name || 'usuário'}`);
      onUpdate?.();
      setShowDropdown(false);
    } catch (error) {
      toast.error('Erro ao atribuir conversa');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-3">
      {/* Current Assignment */}
      {currentUser ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {getInitials(currentUser.name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser.email}
            </p>
          </div>
          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Não atribuído
            </p>
          </div>
        </div>
      )}

      {/* Assign/Reassign Button */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {currentUser ? 'Reatribuir conversa' : 'Atribuir conversa'}
          <ChevronDown className="h-4 w-4 ml-auto" />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                Carregando usuários...
              </div>
            ) : users.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                Nenhum usuário disponível
              </div>
            ) : (
              <>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssign(user.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      currentUser?.id === user.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    {currentUser?.id === user.id && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAssignment;
