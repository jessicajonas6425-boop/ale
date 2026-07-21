import React, { useState } from 'react';
import { 
  TrendingUp, 
  XCircle, 
  CheckCircle2, 
  DollarSign, 
  Megaphone, 
  Eye, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  ShoppingBag, 
  Building2, 
  Ticket,
  Calendar,
  FileText
} from 'lucide-react';
import { Venda, Anuncio, UserProfile, Banco } from '../../types';
import { ActiveTab } from '../Sidebar';

interface DashboardViewProps {
  vendas: Venda[];
  anuncios: Anuncio[];
  bancos?: Banco[];
  currentUser: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onAddAnuncio?: (anuncio: Omit<Anuncio, 'id'>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vendas,
  anuncios,
  bancos = [],
  currentUser,
  setActiveTab,
  onAddAnuncio
}) => {
  const [showAddAnuncioModal, setShowAddAnuncioModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'MURAL' | 'VENDEDOR'>('MURAL');

  // Filter sales for current user if corretor, or all if admin
  const userVendas = currentUser.role === 'admin' 
    ? vendas 
    : vendas.filter(v => v.corretorId === currentUser.uid || v.corretorName === currentUser.name);

  // Metrics calculations
  const totalVendasMesCount = userVendas.length;
  const totalVendasMesValor = userVendas.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const vendasCanceladasList = userVendas.filter(v => v.status === 'Cancelado');
  const vendasCanceladasCount = vendasCanceladasList.length;
  const valorTotalCancelado = vendasCanceladasList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const vendasEfetivasList = userVendas.filter(v => v.status === 'Pago' || v.status === 'Aprovado');
  const valorTotalEfetivo = vendasEfetivasList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalComissoes = userVendas
    .filter(v => v.status === 'Pago' || v.status === 'Aprovado')
    .reduce((acc, curr) => acc + (currentUser.role === 'admin' ? curr.partnerCommission : curr.vendorCommission), 0);

  const muralAnuncios = anuncios.filter(a => a.category === 'MURAL' && a.active);
  const vendedorAnuncios = anuncios.filter(a => a.category === 'VENDEDOR' && a.active);

  const handleCreateAnuncio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !onAddAnuncio) return;

    onAddAnuncio({
      title: newTitle,
      content: newContent,
      category: newCategory,
      date: new Date().toLocaleDateString('pt-BR'),
      active: true,
      author: currentUser.name
    });

    setNewTitle('');
    setNewContent('');
    setShowAddAnuncioModal(false);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 pb-12" id="dashboard-view">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#002B2A] via-[#004D4A] to-[#007A78] p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#3CE5DB]" />
              <span>Painel de Produção Consignada</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Bem-vindo(a), {currentUser.name}!
            </h2>
            <p className="text-teal-100/90 text-sm max-w-2xl">
              Sistema CRM do <strong className="text-white">Grupo Alexandrita</strong>. Acompanhe suas propostas em tempo real, tabelas de comissão atualizadas e links dos bancos parceiros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('vendas')}
              className="px-4 py-2.5 bg-white text-[#007A78] hover:bg-teal-50 font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
              id="dash-nova-venda-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Venda</span>
            </button>

            <button
              onClick={() => setActiveTab('chamados')}
              className="px-4 py-2.5 bg-[#004845]/80 hover:bg-[#003836] text-white font-semibold rounded-xl text-sm border border-teal-300/30 transition-all flex items-center gap-2"
              id="dash-novo-chamado-btn"
            >
              <Ticket className="w-4 h-4 text-[#3CE5DB]" />
              <span>Abrir Chamado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards (Bento Grid Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Vendas no Mês */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-teal-100 flex items-center justify-between hover:shadow-md transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vendas no Mês</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{totalVendasMesCount} <span className="text-xs text-gray-400 font-normal">contratos</span></span>
            <span className="text-xs font-semibold text-[#007A78] mt-1">{formatCurrency(totalVendasMesValor)}</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#007A78] shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Vendas Canceladas */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-red-100 flex items-center justify-between hover:shadow-md transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Canceladas</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{vendasCanceladasCount} <span className="text-xs text-gray-400 font-normal">propostas</span></span>
            <span className="text-xs font-semibold text-red-500 mt-1">{formatCurrency(valorTotalCancelado)}</span>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Volume Efetivo (Col-span-2 Bento element) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-teal-100 flex items-center justify-between sm:col-span-2 hover:shadow-md transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Volume Efetivo</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(valorTotalEfetivo)}</span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {vendasEfetivasList.length} contratos pagos / aprovados
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-12 px-2">
            <div className="h-4 w-2 bg-teal-200 rounded-full"></div>
            <div className="h-6 w-2 bg-teal-300 rounded-full"></div>
            <div className="h-10 w-2 bg-teal-400 rounded-full"></div>
            <div className="h-8 w-2 bg-[#007A78] rounded-full"></div>
            <div className="h-12 w-2 bg-[#005B58] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Bento Grid (2 cols for Mural & 1 col for Live Bancos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Bento Column: Announcements (Mural) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-teal-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#007A78]" />
              <span>Seu Mural & Comunicados</span>
            </h3>
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewCategory('MURAL');
                    setShowAddAnuncioModal(true);
                  }}
                  className="px-3 py-1 bg-[#007A78] hover:bg-[#005B58] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Anúncio</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4 overflow-y-auto max-h-[460px]">
            {/* Mural Items */}
            {muralAnuncios.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border-l-4 border-[#007A78] bg-teal-50/50 flex gap-4">
                <div className="w-10 h-10 bg-[#007A78] text-white rounded-lg shrink-0 flex items-center justify-center font-bold text-xs">
                  !
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                  <span className="text-[10px] text-[#007A78] font-semibold mt-2 block">
                    Publicado por: {item.author}
                  </span>
                </div>
              </div>
            ))}

            {/* Vendedor Items */}
            {vendedorAnuncios.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 flex gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg shrink-0 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-2 block">
                    Visível aos Vendedores • Enviado por: {item.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Bento Column: Live Bancos Status */}
        <div className="bg-white rounded-2xl shadow-xs border border-teal-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#007A78]" />
            <h3 className="font-bold text-gray-700">Bancos Parceiros</h3>
            <div className="flex-1"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ao vivo</span>
          </div>

          <div className="p-2 divide-y divide-gray-50 overflow-y-auto max-h-[460px]">
            {bancos.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Nenhum banco cadastrado.
              </div>
            ) : (
              bancos.map((b) => (
                <a
                  key={b.id}
                  href={b.loginUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 flex items-center justify-between hover:bg-teal-50/50 transition-colors rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center font-bold text-[#007A78] text-xs group-hover:bg-[#007A78] group-hover:text-white transition-colors">
                      {b.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 group-hover:text-[#007A78] transition-colors">{b.name}</p>
                      <p className="text-[10px] text-gray-400">{b.category || 'Acesso Direto'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-bold rounded uppercase tracking-wider ${
                    b.status === 'ATIVO' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : b.status === 'MANUTENÇÃO'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <span>Acesso Rápido Módulos</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('bancos')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <Building2 className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Bancos</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Links de login</div>
          </button>

          <button
            onClick={() => setActiveTab('vendas')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <ShoppingBag className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Minhas Vendas</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Exportar contrato</div>
          </button>

          <button
            onClick={() => setActiveTab('tabelas')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <FileText className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Tabelas</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Coeficientes</div>
          </button>

          <button
            onClick={() => setActiveTab('chamados')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <Ticket className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Chamados</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Suporte & senhas</div>
          </button>

          <button
            onClick={() => setActiveTab('logins')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <ArrowUpRight className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Logins</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Usuários cadastrados</div>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className="p-4 rounded-xl bg-teal-50/60 hover:bg-[#007A78] hover:text-white text-teal-950 transition-all text-left group"
          >
            <Sparkles className="w-6 h-6 text-[#007A78] group-hover:text-white mb-2" />
            <div className="font-bold text-xs">Meu Perfil</div>
            <div className="text-[10px] text-slate-500 group-hover:text-teal-100">Documentos e PIX</div>
          </button>
        </div>
      </div>

      {/* Admin Add Announcement Modal */}
      {showAddAnuncioModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Novo Comunicado / Anúncio</h3>
            <form onSubmit={handleCreateAnuncio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Anúncio</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Atualização da Tabela INSS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destino do Anúncio</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as 'MURAL' | 'VENDEDOR')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  <option value="MURAL">Seu Mural (Geral)</option>
                  <option value="VENDEDOR">Seu Vendedor Vê (Exclusivo Vendedores)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escreva a mensagem aqui..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:ring-2 focus:ring-teal-100 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnuncioModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A78] hover:bg-[#005B58] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Publicar Anúncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
