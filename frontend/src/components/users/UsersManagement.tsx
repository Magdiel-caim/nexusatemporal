import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Shield, CheckCircle, XCircle, Search, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Protected from '@/components/permissions/Protected';
import { Permission } from '@/types/permissions';
import UserFormModal from './UserFormModal';
import DeleteUserModal from './DeleteUserModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
  tenantId?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  super_admin: 'Super Admin',
  owner: 'Proprietário',
  manager: 'Gerente',
  admin: 'Administrador',
  user: 'Usuário',
  receptionist: 'Recepcionista',
  professional: 'Profissional',
  doctor: 'Médico',
};

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  receptionist: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  professional: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  doctor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const UsersManagement: React.FC = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{
        success: boolean;
        data: { users: User[]; total: number };
      }>(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm || undefined },
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      if (modalMode === 'create') {
        const response = await axios.post<{
          success: boolean;
          data: User;
          message: string;
        }>(`${API_URL}/users`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success(response.data.message || 'Usuário criado com sucesso!');
          fetchUsers();
        }
      } else {
        const response = await axios.put<{
          success: boolean;
          data: User;
          message: string;
        }>(`${API_URL}/users/${selectedUser?.id}`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success(response.data.message || 'Usuário atualizado com sucesso!');
          fetchUsers();
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      const response = await axios.delete<{
        success: boolean;
        message: string;
      }>(`${API_URL}/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Usuário excluído com sucesso!');
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir usuário');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResendEmail = async (user: User) => {
    try {
      toast.loading('Reenviando email...', { id: 'resend-email' });

      const response = await axios.post<{
        success: boolean;
        message: string;
      }>(`${API_URL}/users/${user.id}/resend-welcome-email`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Email reenviado com sucesso!', { id: 'resend-email' });
      }
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast.error(error.response?.data?.message || 'Erro ao reenviar email', { id: 'resend-email' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuários e Permissões</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie usuários, funções e permissões de acesso
          </p>
        </div>

        <Protected permission={[Permission.USERS_CREATE, Permission.USERS_CREATE_BASIC]}>
          <button
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        </Protected>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Carregando usuários...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          roleColors[user.role] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Protected permission={[Permission.USERS_UPDATE, Permission.USERS_UPDATE_BASIC]}>
                          <button
                            onClick={() => handleResendEmail(user)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Reenviar email de boas-vindas"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </Protected>

                        <Protected permission={[Permission.USERS_UPDATE, Permission.USERS_UPDATE_BASIC]}>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Protected>

                        <Protected permission={Permission.USERS_DELETE}>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Protected>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Administradores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => ['admin', 'owner', 'superadmin'].includes(u.role)).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={selectedUser?.name || ''}
        loading={deleteLoading}
      />
    </div>
  );
};

export default UsersManagement;
