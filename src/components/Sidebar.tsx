import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ShoppingBag, 
  Table, 
  Ticket, 
  Keyboard, 
  Key, 
  Users, 
  UserCircle,
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'bancos'
  | 'vendas'
  | 'tabelas'
  | 'chamados'
  | 'digitacao'
  | 'logins'
  | 'vendedores'
  | 'perfil';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onToggleRole?: () => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bancos' as ActiveTab, label: 'Bancos', icon: Building2 },
    { id: 'vendas' as ActiveTab, label: 'Vendas', icon: ShoppingBag },
    { id: 'tabelas' as ActiveTab, label: 'Tabelas', icon: Table },
    { id: 'chamados' as ActiveTab, label: 'Chamados', icon: Ticket, badge: 'Abertos' },
    { id: 'digitacao' as ActiveTab, label: 'Digitação Interna', icon: Keyboard },
    { id: 'logins' as ActiveTab, label: 'Logins', icon: Key },
    { id: 'vendedores' as ActiveTab, label: 'Vendedores', icon: Users, adminOnly: true },
    { id: 'perfil' as ActiveTab, label: 'Meu Perfil', icon: UserCircle },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpenMobile && setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#002B2A] text-white z-50 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        id="sidebar-container"
      >
        {/* Top Logo Section */}
        <div>
          <div className="p-5 bg-gradient-to-br from-[#006361] to-[#004846] shadow-inner border-b border-[#00807C]/30 flex items-center justify-center">
            <Logo size="md" />
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
            <div className="px-3 py-2.5 text-[10px] font-bold text-[#00D0C5] uppercase tracking-widest">
              Menu Principal
            </div>

            {menuItems.map((item) => {
              // Hide admin-only items if user is corretor
              if (item.adminOnly && currentUser.role !== 'admin') {
                return null;
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#007A78] text-white border-r-4 border-[#3CE5DB] shadow-lg shadow-teal-950/50 font-semibold'
                      : 'text-teal-100/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-teal-300 group-hover:text-white group-hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {isActive ? (
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  ) : item.badge ? (
                    <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Footer Controls */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          {/* Static Session Status Badge */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
            currentUser.role === 'admin' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              : 'bg-teal-500/10 border-teal-500/20 text-teal-200'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${currentUser.role === 'admin' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="font-extrabold text-[11px] uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Sessão Administrador' : 'Sessão Corretor'}
              </span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
              currentUser.role === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {currentUser.role === 'admin' ? 'Admin' : 'Ativo'}
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#007A78] flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  <p className="text-[10px] text-teal-200 uppercase tracking-tight font-medium">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Corretor Autorizado'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-teal-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sair do sistema"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
