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
  TrendingUp,
  Share2,
  ChevronDown,
  ChevronRight,
  Receipt,
  CreditCard,
  TrendingDown,
  FileSpreadsheet,
  Building,
  ShoppingCart,
  BarChart2,
  Zap,
  Mail,
  Globe,
  Bot,
  AlertCircle,
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

interface SubMenuItem {
  icon: any;
  label: string;
  path: string;
  roles?: string[];
}

interface MenuItem {
  icon: any;
  label: string;
  path?: string; // Opcional se tiver submenus
  roles?: string[];
  submenu?: SubMenuItem[];
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: FileText, label: 'Prontuários', path: '/prontuarios' },
  { icon: Users2, label: 'Pacientes', path: '/pacientes' },
  {
    icon: DollarSign,
    label: 'Financeiro',
    path: '/financeiro',
    roles: ['superadmin', 'owner', 'admin'],
    submenu: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/financeiro/dashboard', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Receipt, label: 'Transações', path: '/financeiro/transacoes', roles: ['superadmin', 'owner', 'admin'] },
      { icon: CreditCard, label: 'Contas a Pagar', path: '/financeiro/contas-pagar', roles: ['superadmin', 'owner', 'admin'] },
      { icon: TrendingUp, label: 'Contas a Receber', path: '/financeiro/contas-receber', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Building, label: 'Fornecedores', path: '/financeiro/fornecedores', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileText, label: 'Recibos/NF', path: '/financeiro/recibos', roles: ['superadmin', 'owner', 'admin'] },
      { icon: TrendingDown, label: 'Fluxo de Caixa', path: '/financeiro/fluxo-caixa', roles: ['superadmin', 'owner', 'admin'] },
      { icon: ShoppingCart, label: 'Ordens de Compra', path: '/financeiro/ordens-compra', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileSpreadsheet, label: 'Relatórios', path: '/financeiro/relatorios', roles: ['superadmin', 'owner', 'admin'] },
    ],
  },
  {
    icon: TrendingUp,
    label: 'Vendas',
    path: '/vendas',
    roles: ['superadmin', 'owner', 'admin'],
    submenu: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/vendas/dashboard', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Users, label: 'Vendedores', path: '/vendas/vendedores', roles: ['superadmin', 'owner', 'admin'] },
      { icon: ShoppingCart, label: 'Vendas', path: '/vendas/vendas', roles: ['superadmin', 'owner', 'admin'] },
      { icon: DollarSign, label: 'Comissões', path: '/vendas/comissoes', roles: ['superadmin', 'owner', 'admin'] },
    ],
  },
  {
    icon: Package,
    label: 'Estoque',
    path: '/estoque',
    roles: ['superadmin', 'owner', 'admin'],
    submenu: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/estoque/dashboard', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Package, label: 'Produtos', path: '/estoque/produtos', roles: ['superadmin', 'owner', 'admin'] },
      { icon: TrendingUp, label: 'Movimentações', path: '/estoque/movimentacoes', roles: ['superadmin', 'owner', 'admin'] },
      { icon: AlertCircle, label: 'Alertas', path: '/estoque/alertas', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileSpreadsheet, label: 'Relatórios', path: '/estoque/relatorios', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileText, label: 'Procedimentos', path: '/estoque/procedimentos', roles: ['superadmin', 'owner', 'admin'] },
      { icon: BarChart2, label: 'Inventário', path: '/estoque/inventario', roles: ['superadmin', 'owner', 'admin'] },
    ],
  },
  { icon: Users2, label: 'Colaboração', path: '/colaboracao' },
  {
    icon: BarChart3,
    label: 'BI & Analytics',
    path: '/bi',
    roles: ['superadmin', 'owner', 'admin'],
    submenu: [
      { icon: BarChart2, label: 'Dashboards', path: '/bi/dashboards', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileSpreadsheet, label: 'Relatórios', path: '/bi/relatorios', roles: ['superadmin', 'owner', 'admin'] },
    ],
  },
  {
    icon: Share2,
    label: 'Redes Sociais',
    path: '/redes-sociais',
    roles: ['superadmin', 'owner', 'admin'],
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    path: '/marketing',
    roles: ['superadmin', 'owner', 'admin'],
    submenu: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/marketing/dashboard', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Zap, label: 'Campanhas', path: '/marketing/campanhas', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Globe, label: 'Redes Sociais', path: '/marketing/social', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Mail, label: 'Mensagens em Massa', path: '/marketing/mensagens', roles: ['superadmin', 'owner', 'admin'] },
      { icon: FileText, label: 'Landing Pages', path: '/marketing/landing-pages', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Bot, label: 'Assistente IA', path: '/marketing/ia', roles: ['superadmin', 'owner', 'admin'] },
      { icon: BarChart2, label: 'Uso de IA', path: '/marketing/ia-usage', roles: ['superadmin', 'owner', 'admin'] },
      { icon: Zap, label: 'Automações', path: '/marketing/automacoes', roles: ['superadmin', 'owner', 'admin'] },
    ],
  },
  {
    icon: Settings,
    label: 'Configurações',
    path: '/configuracoes',
    roles: ['superadmin', 'owner'],
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();

  // Debug: verificar se menu de Pacientes existe
  console.log('🔍 DEBUG - Menu Items:', allMenuItems.map(item => item.label));

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
    }).map(item => {
      // Filtrar submenus também
      if (item.submenu) {
        return {
          ...item,
          submenu: item.submenu.filter(sub => {
            if (userEmail === 'teste@nexusatemporal.com.br') return true;
            if (!sub.roles) return true;
            return sub.roles.includes(userRole);
          }),
        };
      }
      return item;
    });
  }, [user?.role, user?.email]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Auto-expandir menu se submenu está ativo
  useMemo(() => {
    menuItems.forEach(item => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(sub =>
          location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
        );
        if (hasActiveSubmenu && !expandedMenus.includes(item.label)) {
          setExpandedMenus(prev => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname, menuItems]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.path) {
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    }
    if (item.submenu) {
      return item.submenu.some(sub =>
        location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
      );
    }
    return false;
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
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.label);
            const isActive = isMenuActive(item);

            return (
              <div key={item.label}>
                {/* Menu principal */}
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className="flex-shrink-0" />
                      {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path!}
                    className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isExpanded && sidebarOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/');

                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors text-sm ${
                            isSubActive
                              ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <SubIcon size={16} className="flex-shrink-0" />
                          <span className="ml-3">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
            {menuItems.find((item) => item.path === location.pathname)?.label ||
             menuItems.find((item) => item.submenu?.some(sub => sub.path === location.pathname))?.submenu?.find(sub => sub.path === location.pathname)?.label ||
             'Dashboard'}
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
