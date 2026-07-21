import React from 'react';
import { Menu, Search, Bell, Radio, Shield, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: UserProfile;
  setIsOpenMobile: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNavigateProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  setIsOpenMobile,
  searchTerm,
  setSearchTerm,
  onNavigateProfile
}) => {
  const pageTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Geral', subtitle: 'Acompanhe seu desempenho e comunicados em tempo real' },
    bancos: { title: 'Bancos Parceiros', subtitle: 'Sistemas operacionais e links de acesso direto' },
    vendas: { title: 'Minhas Vendas & Contratos', subtitle: 'Gestão completa da carteira de propostas e comissões' },
    tabelas: { title: 'Tabelas de Comissões', subtitle: 'Consulte os coeficientes e percentuais vigentes por banco' },
    chamados: { title: 'Central de Chamados', subtitle: 'Solicitações de senha, suporte e suporte operacional' },
    digitacao: { title: 'Digitação Interna', subtitle: 'Esteira de propostas enviadas para digitação centralizada' },
    logins: { title: 'Logins de Acesso', subtitle: 'Credenciais e usuários cadastrados para as esteiras' },
    vendedores: { title: 'Gestão de Corretores', subtitle: 'Lista completa de vendedores cadastrados na plataforma' },
    perfil: { title: 'Meu Perfil', subtitle: 'Dados cadastrais, chave PIX e upload de documentos' },
  };

  const currentInfo = pageTitles[activeTab] || { title: 'Grupo Alexandrita', subtitle: 'Sistema CRM Consignado' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-teal-100 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left side title & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2 text-slate-600 hover:text-[#007A78] hover:bg-teal-50 rounded-xl lg:hidden"
          id="mobile-menu-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Realtime Live Connection Badge */}
        <div className="hidden md:flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200/80 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
          </span>
          <Radio className="w-3.5 h-3.5 text-[#007A78]" />
          <span>Realtime Firebase</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, CPF, banco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-teal-50/40 hover:bg-white focus:bg-white border border-teal-100 focus:border-[#007A78] focus:ring-2 focus:ring-teal-100 rounded-xl text-xs text-gray-800 transition-all outline-none"
            id="global-search-input"
          />
        </div>

        {/* Notifications Icon */}
        <button 
          className="p-2 text-gray-400 hover:text-[#007A78] bg-white rounded-xl shadow-xs border border-teal-100 relative transition-all"
          title="Notificações"
          id="header-notifications-btn"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Badge Profile Click */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white hover:bg-teal-50 border border-teal-100 rounded-xl shadow-xs transition-all"
          id="header-user-btn"
        >
          <div className="w-8 h-8 rounded-xl bg-[#007A78] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-gray-800 leading-tight">
              {currentUser.name.split(' ')[0]}
            </div>
            <div className="text-[10px] font-bold text-[#007A78] uppercase flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              {currentUser.role}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
