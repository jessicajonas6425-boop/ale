import React, { useState } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  Plus, 
  Table, 
  Percent, 
  Building2, 
  Edit, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  RefreshCw,
  X
} from 'lucide-react';
import { TabelaComissao, Banco, UserProfile } from '../../types';
import { exportToExcel } from '../../lib/exportToExcel';

interface TabelasViewProps {
  tabelas: TabelaComissao[];
  bancos: Banco[];
  currentUser: UserProfile;
  onAddTabela?: (tabela: Omit<TabelaComissao, 'id'>) => void;
  onUpdateTabela?: (id: string, updatedData: Partial<TabelaComissao>) => void;
  onDeleteTabela?: (id: string) => void;
  onUpdateBancoCommission?: (bancoId: string, defaultCommission: number) => void;
}

export const TabelasView: React.FC<TabelasViewProps> = ({
  tabelas,
  bancos,
  currentUser,
  onAddTabela,
  onUpdateTabela,
  onDeleteTabela,
  onUpdateBancoCommission
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Sub-tabs for Admin: 'tabelas' | 'admin_bancos'
  const [activeSubTab, setActiveSubTab] = useState<'tabelas' | 'admin_bancos'>('admin_bancos');

  // Search & Filter State
  const [filterBanco, setFilterBanco] = useState<string>('ALL');
  const [filterProduct, setFilterProduct] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bankSearchTerm, setBankSearchTerm] = useState('');

  // Inline Editing State for Bank Commissions
  const [editingBankCommissions, setEditingBankCommissions] = useState<{ [bancoId: string]: number }>({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Modal State for Adding/Editing Tabela
  const [showModal, setShowModal] = useState(false);
  const [editingTabelaId, setEditingTabelaId] = useState<string | null>(null);
  const [bancoId, setBancoId] = useState('');
  const [product, setProduct] = useState('INSS Novo');
  const [tableName, setTableName] = useState('');
  const [valueRange, setValueRange] = useState('R$ 1.000,00 a R$ 50.000,00');
  const [commissionPercent, setCommissionPercent] = useState<number | ''>(12);
  const [maxInstallments, setMaxInstallments] = useState(84);
  const [tableStatus, setTableStatus] = useState<'Ativa' | 'Inativa'>('Ativa');

  // Handle Bank Commission Input Change
  const handleBankCommissionChange = (bancoId: string, value: number) => {
    setEditingBankCommissions(prev => ({
      ...prev,
      [bancoId]: value
    }));
  };

  // Save Bank Commission to Firestore in Real Time
  const handleSaveBankCommission = (banco: Banco) => {
    const val = editingBankCommissions[banco.id] ?? banco.defaultCommission ?? 12.0;
    if (onUpdateBancoCommission) {
      onUpdateBancoCommission(banco.id, val);
      setSavedSuccessMsg(`Porcentagem do ${banco.name} atualizada para ${val}% no banco de dados!`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    }
  };

  // Open Modal to Add Tabela
  const handleOpenAddModal = (presetBancoId?: string) => {
    setEditingTabelaId(null);
    setBancoId(presetBancoId || (bancos[0]?.id || ''));
    setProduct('INSS Novo');
    setTableName('');
    setValueRange('R$ 1.000,00 a R$ 50.000,00');
    setCommissionPercent(12);
    setMaxInstallments(84);
    setTableStatus('Ativa');
    setShowModal(true);
  };

  // Open Modal to Edit Tabela
  const handleOpenEditModal = (tabela: TabelaComissao) => {
    setEditingTabelaId(tabela.id);
    setBancoId(tabela.bancoId);
    setProduct(tabela.product);
    setTableName(tabela.tableName);
    setValueRange(tabela.valueRange);
    setCommissionPercent(tabela.commissionPercent);
    setMaxInstallments(tabela.maxInstallments);
    setTableStatus(tabela.status);
    setShowModal(true);
  };

  // Save or Update Tabela
  const handleSaveTabela = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName || commissionPercent === '' || commissionPercent === undefined) return;

    const bObj = bancos.find((b) => b.id === bancoId || b.name === bancoId);
    const bName = bObj ? bObj.name : 'Banco Pan';

    if (editingTabelaId && onUpdateTabela) {
      onUpdateTabela(editingTabelaId, {
        bancoId,
        bancoName: bName,
        product,
        tableName,
        valueRange,
        commissionPercent: Number(commissionPercent),
        maxInstallments: Number(maxInstallments),
        status: tableStatus,
      });
      setSavedSuccessMsg(`Tabela "${tableName}" atualizada com sucesso!`);
    } else if (onAddTabela) {
      onAddTabela({
        bancoId: bancoId || 'pan',
        bancoName: bName,
        product,
        tableName,
        valueRange,
        commissionPercent: Number(commissionPercent),
        maxInstallments: Number(maxInstallments),
        status: tableStatus,
      });
      setSavedSuccessMsg(`Nova tabela "${tableName}" cadastrada no Firestore!`);
    }

    setTimeout(() => setSavedSuccessMsg(null), 3500);
    setShowModal(false);
  };

  // Toggle Table Status (Ativa/Inativa)
  const handleToggleStatus = (tabela: TabelaComissao) => {
    if (!onUpdateTabela) return;
    const newStatus = tabela.status === 'Ativa' ? 'Inativa' : 'Ativa';
    onUpdateTabela(tabela.id, { status: newStatus });
  };

  // Delete Tabela
  const handleDelete = (tabelaId: string, name: string) => {
    if (!onDeleteTabela) return;
    if (window.confirm(`Tem certeza que deseja excluir a tabela "${name}"?`)) {
      onDeleteTabela(tabelaId);
      setSavedSuccessMsg(`Tabela excluída do banco de dados.`);
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    }
  };

  // Filtered Tables
  const filteredTabelas = tabelas.filter((t) => {
    if (filterBanco !== 'ALL' && t.bancoId !== filterBanco && t.bancoName !== filterBanco) {
      return false;
    }
    if (filterProduct !== 'ALL' && t.product !== filterProduct) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = t.tableName.toLowerCase().includes(q);
      const matchBanco = t.bancoName.toLowerCase().includes(q);
      const matchProd = t.product.toLowerCase().includes(q);
      if (!matchName && !matchBanco && !matchProd) return false;
    }
    return true;
  });

  // Filtered Banks for Admin Config
  const filteredBancos = bancos.filter((b) => {
    if (!bankSearchTerm.trim()) return true;
    const q = bankSearchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  });

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredTabelas.map((t) => ({
      Banco: t.bancoName,
      Produto: t.product,
      'Nome da Tabela': t.tableName,
      'Faixa de Valor': t.valueRange,
      'Comissão (%)': `${t.commissionPercent}%`,
      'Máx. Parcelas': `${t.maxInstallments}x`,
      Status: t.status,
    }));

    exportToExcel(exportData, 'Tabelas_Comissao_Grupo_Alexandrita', 'Tabelas');
  };

  return (
    <div className="space-y-6 pb-12" id="tabelas-view">
      {/* Real-time Toast Success Notification */}
      {savedSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">{savedSuccessMsg}</span>
          <button onClick={() => setSavedSuccessMsg(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner with Live DB Sync Badge */}
      <div className="bg-gradient-to-r from-[#002B2A] via-[#004846] to-[#006361] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-[11px] rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Firestore Live Sync — Tempo Real</span>
              </span>
              {isAdmin && (
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-[10px] rounded-full uppercase">
                  Painel Administrativo
                </span>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-teal-300" />
              <span>Configuração de Tabelas & Comissões por Banco</span>
            </h1>
            <p className="text-teal-100/80 text-xs mt-1 max-w-2xl">
              Altere as porcentagens operacionais de cada banco e gerencie as tabelas vigentes do Grupo Alexandrita em tempo real no banco de dados.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                id="header-add-tabela-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Tabela</span>
              </button>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors backdrop-blur-md border border-white/20 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Header Stats Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-teal-200 text-[10px] uppercase font-bold tracking-wider block">Bancos Cadastrados</span>
            <span className="text-lg font-black text-white">{bancos.length} Bancos</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-teal-200 text-[10px] uppercase font-bold tracking-wider block">Tabelas Vigentes</span>
            <span className="text-lg font-black text-emerald-300">{tabelas.length} Ativas</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-teal-200 text-[10px] uppercase font-bold tracking-wider block">Média de Comissão</span>
            <span className="text-lg font-black text-amber-300">
              {(
                bancos.reduce((acc, b) => acc + (b.defaultCommission || 12), 0) / Math.max(1, bancos.length)
              ).toFixed(1)}%
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs">
            <span className="text-teal-200 text-[10px] uppercase font-bold tracking-wider block">Status do Banco de Dados</span>
            <span className="text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Sincronizado
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Tabelas Vigentes vs Config de Porcentagem) */}
      <div className="flex items-center justify-between border-b border-teal-100 bg-white p-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setActiveSubTab('admin_bancos')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeSubTab === 'admin_bancos'
                  ? 'bg-[#007A78] text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Configuração de Porcentagens por Banco ({bancos.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('tabelas')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeSubTab === 'tabelas'
                ? 'bg-[#007A78] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Gerenciador de Tabelas & Coeficientes ({tabelas.length})</span>
          </button>
        </div>

        {isAdmin && (
          <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1 pr-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Edições aplicadas em tempo real p/ todos os corretores</span>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: CONFIGURAÇÃO DE PORCENTAGENS POR BANCO (ADMIN AREA) */}
      {activeSubTab === 'admin_bancos' && isAdmin && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#007A78]" />
                  <span>Porcentagens de Trabalho Padrão por Banco</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajuste a comissão operacional padrão atribuída a cada banco. As alterações são sincronizadas imediatamente na nuvem.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar banco ou código..."
                  value={bankSearchTerm}
                  onChange={(e) => setBankSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#007A78] outline-none font-semibold"
                />
              </div>
            </div>

            {/* Grid of All Banks with Inline Percentage Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBancos.map((banco) => {
                const currentComm = editingBankCommissions[banco.id] ?? banco.defaultCommission ?? 12.0;
                const isModified = editingBankCommissions[banco.id] !== undefined && editingBankCommissions[banco.id] !== (banco.defaultCommission ?? 12.0);

                return (
                  <div 
                    key={banco.id} 
                    className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:border-teal-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#007A78] text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                          {banco.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{banco.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Cód: {banco.code} • {banco.category || 'Consignado'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        banco.status === 'ATIVO' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {banco.status}
                      </span>
                    </div>

                    {/* Percentage Editing Control */}
                    <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-[#007A78]" />
                        <span className="text-xs font-bold text-slate-700">Porcentagem do Site:</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative w-24">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={currentComm}
                            onChange={(e) => handleBankCommissionChange(banco.id, parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-teal-200 rounded-lg text-xs font-black text-[#007A78] text-right focus:border-[#007A78] outline-none shadow-inner"
                          />
                          <span className="absolute right-2 top-1.5 text-xs font-bold text-slate-400 pointers-events-none">%</span>
                        </div>

                        <button
                          onClick={() => handleSaveBankCommission(banco)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                            isModified 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
                              : 'bg-[#007A78] hover:bg-[#005B58] text-white'
                          }`}
                          title="Salvar Porcentagem no Banco de Dados"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                      <span>{tabelas.filter(t => t.bancoId === banco.id || t.bancoName === banco.name).length} tabelas ativas</span>
                      <button
                        onClick={() => handleOpenAddModal(banco.id)}
                        className="text-[#007A78] font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Criar Tabela</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GERENCIADOR DE TABELAS VIGENTES */}
      {(activeSubTab === 'tabelas' || !isAdmin) && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Table className="w-4 h-4 text-[#007A78]" />
                <span>Tabelas de Comissão & Coeficientes Cadastrados</span>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                  id="add-tabela-main-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Tabela</span>
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por tabela ou banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#007A78] outline-none"
                />
              </div>

              <select
                value={filterBanco}
                onChange={(e) => setFilterBanco(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#007A78] outline-none"
              >
                <option value="ALL">Todos os Bancos ({bancos.length})</option>
                {bancos.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#007A78] outline-none"
              >
                <option value="ALL">Todos os Produtos</option>
                <option value="INSS Novo">INSS Novo</option>
                <option value="Refinanciamento">Refinanciamento INSS</option>
                <option value="Portabilidade">Portabilidade</option>
                <option value="Antecipação FGTS">Antecipação FGTS</option>
                <option value="Cartão Benefício">Cartão Benefício</option>
                <option value="BPC / LOAS">BPC / LOAS</option>
                <option value="SIAPE / Governos">SIAPE / Governos</option>
              </select>
            </div>
          </div>

          {/* Tabelas Table Data */}
          <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002B2A] text-white font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Banco</th>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">Nome da Tabela</th>
                    <th className="py-3.5 px-4">Faixa de Valor</th>
                    <th className="py-3.5 px-4">Comissão (%)</th>
                    <th className="py-3.5 px-4 text-center">Parcelas</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    {isAdmin && <th className="py-3.5 px-4 text-center">Ações Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTabelas.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-400 font-semibold">
                        Nenhuma tabela cadastrada para estes filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredTabelas.map((tab) => (
                      <tr key={tab.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#007A78] text-white flex items-center justify-center font-black text-[10px]">
                            {tab.bancoName.charAt(0)}
                          </div>
                          <span>{tab.bancoName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#007A78]">
                          {tab.product}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {tab.tableName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {tab.valueRange}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg border border-emerald-200">
                            {tab.commissionPercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-800">
                          Até {tab.maxInstallments}x
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => isAdmin && handleToggleStatus(tab)}
                            className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-full uppercase transition-transform active:scale-95 ${
                              tab.status === 'Ativa'
                                ? 'bg-teal-100 text-[#007A78] hover:bg-teal-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={isAdmin ? 'Clique para alternar Status' : undefined}
                          >
                            {tab.status}
                          </button>
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(tab)}
                                className="p-1.5 bg-teal-50 hover:bg-teal-100 text-[#007A78] rounded-lg transition-colors"
                                title="Editar Tabela"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(tab.id, tab.tableName)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                title="Excluir Tabela"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Table Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-[#007A78]" />
              <span>{editingTabelaId ? 'Editar Tabela de Comissão' : 'Nova Tabela de Comissão'}</span>
            </h3>

            <form onSubmit={handleSaveTabela} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco</label>
                <select
                  required
                  value={bancoId}
                  onChange={(e) => setBancoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                >
                  <option value="">Selecione o Banco</option>
                  {bancos.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Porcentagem atual: {b.defaultCommission ?? 12}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Produto / Operação</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                >
                  <option value="INSS Novo">INSS Novo</option>
                  <option value="Refinanciamento">Refinanciamento INSS</option>
                  <option value="Portabilidade">Portabilidade</option>
                  <option value="Antecipação FGTS">Antecipação FGTS</option>
                  <option value="Cartão Benefício">Cartão Benefício</option>
                  <option value="BPC / LOAS">BPC / LOAS</option>
                  <option value="SIAPE / Governos">SIAPE / Governos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Tabela</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pan Ouro Premium 84x"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faixa de Valor</label>
                <input
                  type="text"
                  value={valueRange}
                  onChange={(e) => setValueRange(e.target.value)}
                  placeholder="Ex: R$ 1.000,00 a R$ 50.000,00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-black text-[#007A78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Máx Parcelas</label>
                  <input
                    type="number"
                    value={maxInstallments}
                    onChange={(e) => setMaxInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status da Tabela</label>
                <select
                  value={tableStatus}
                  onChange={(e) => setTableStatus(e.target.value as 'Ativa' | 'Inativa')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold"
                >
                  <option value="Ativa">Ativa (Disponível)</option>
                  <option value="Inativa">Inativa (Oculta/Pausada)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A78] hover:bg-[#005B58] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingTabelaId ? 'Salvar Alterações' : 'Cadastrar Tabela'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
