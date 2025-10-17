import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign,
  Package,
  Users2,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import logoFull from '@/assets/images/logo-full.png';
import logoIcon from '@/assets/images/logo-icon.png';
import logoFullLight from '@/assets/images/logo-full-alt.png';
import logoIconLight from '@/assets/images/logo-icon-alt.png';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  roles?: string[]; // Se não definido, todos podem acessar
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: FileText, label: 'Prontuários', path: '/prontuarios' },
  {
    icon: DollarSign,
    label: 'Financeiro',
    path: '/financeiro',
    roles: ['superadmin', 'owner', 'admin'] // USER e PROFESSIONAL não têm acesso
  },
  {
    icon: Package,
    label: 'Estoque',
    path: '/estoque',
    roles: ['superadmin', 'owner', 'admin'] // USER não tem acesso
  },
  { icon: Users2, label: 'Colaboração', path: '/colaboracao' },
  {
    icon: BarChart3,
    label: 'BI & Analytics',
    path: '/bi',
    roles: ['superadmin', 'owner', 'admin'] // USER e PROFESSIONAL não têm acesso
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    path: '/marketing',
    roles: ['superadmin', 'owner', 'admin'] // USER e PROFESSIONAL não têm acesso
  },
  {
    icon: Settings,
    label: 'Configurações',
    path: '/configuracoes',
    roles: ['superadmin', 'owner'] // Apenas OWNER e SUPERADMIN
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();

  // Filtrar menu items baseado no role do usuário
  const menuItems = useMemo(() => {
    const userRole = user?.role?.toLowerCase() || 'user';
    const userEmail = user?.email?.toLowerCase() || '';

    return allMenuItems.filter(item => {
      // Usuário teste sempre tem acesso total (master user)
      if (userEmail === 'teste@nexusatemporal.com.br') return true;

      // Se o item não especifica roles, todos podem acessar
      if (!item.roles) return true;

      // Verificar se o role do usuário está na lista permitida
      return item.roles.includes(userRole);
    });
  }, [user?.role, user?.email]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <img
              src={theme === 'dark' ? logoFullLight : logoFull}
              alt="Nexus Atemporal"
              className="h-10"
            />
          ) : (
            <img
              src={theme === 'dark' ? logoIconLight : logoIcon}
              alt="Nexus Atemporal"
              className="h-8"
            />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="ml-2">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" id="main-content">{children}</main>
      </div>
    </div>
  );
}
