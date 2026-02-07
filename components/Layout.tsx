
import React from 'react';
import { User } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  Calendar, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  FileText,
  MessageSquare
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

// SidebarItem moved outside to avoid internal definition issues and properly typed to handle 'key' and other props.
const SidebarItem: React.FC<{ 
  item: any; 
  isActive: boolean; 
  onNavigate: (view: string) => void; 
  setIsSidebarOpen: (open: boolean) => void;
}> = ({ 
  item, 
  isActive, 
  onNavigate, 
  setIsSidebarOpen 
}) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        onNavigate(item.id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      <span className="font-medium">{item.label}</span>
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeView, onNavigate, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Safety guard: if user is null or undefined, do not render layout content that depends on user properties.
  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['professor', 'gestor', 'super_admin'] },
    { id: 'schools', label: 'Escolas', icon: School, roles: ['super_admin'] },
    { id: 'classes', label: 'Turmas', icon: Users, roles: ['professor', 'gestor'] },
    { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['professor', 'gestor'] },
    { id: 'tutoring', label: 'Tutoria', icon: BookOpen, roles: ['professor'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['professor', 'gestor'] },
    { id: 'occurrences', label: 'Ocorrências', icon: MessageSquare, roles: ['professor', 'gestor'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">EduSync</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Gestão Escolar</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {filteredItems.map(item => (
              <SidebarItem 
                key={item.id} 
                item={item} 
                isActive={activeView === item.id}
                onNavigate={onNavigate}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                {user.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.nome}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={20} />
              Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-6 py-4 flex items-center justify-between">
          <button 
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} className="text-slate-600" />
          </button>
          
          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Dynamic context actions can be here */}
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
