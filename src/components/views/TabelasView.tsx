import React, { useState } from 'react';
import { Search, FileSpreadsheet, Plus, Table, Percent, Layers, Building2, Filter } from 'lucide-react';
import { TabelaComissao, Banco, UserProfile } from '../../types';
import { exportToExcel } from '../../lib/exportToExcel';

interface TabelasViewProps {
  tabelas: TabelaComissao[];
  bancos: Banco[];
  currentUser: UserProfile;
  onAddTabela?: (tabela: Omit<TabelaComissao, 'id'>) => void;
}

export const TabelasView: React.FC<TabelasViewProps> = ({
  tabelas,
  bancos,
  currentUser,
  onAddTabela
}) => {
  const [filterBanco, setFilterBanco] = useState<string>('ALL');
  const [filterProduct, setFilterProduct] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [bancoId, setBancoId] = useState('');
  const [product, setProduct] = useState('INSS Novo');
  const [tableName, setTableName] = useState('');
  const [valueRange, setValueRange] = useState('R$ 1.000,00 a R$ 50.000,00');
  const [commissionPercent, setCommissionPercent] = useState<number | ''>(12);
  const [maxInstallments, setMaxInstallments] = useState(84);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName || !commissionPercent || !onAddTabela) return;

    const bObj = bancos.find((b) => b.id === bancoId || b.name === bancoId);
    const bName = bObj ? bObj.name : 'Banco Pan';

    onAddTabela({
      bancoId: bancoId || 'pan',
      bancoName: bName,
      product,
      tableName,
      valueRange,
      commissionPercent: Number(commissionPercent),
      maxInstallments: Number(maxInstallments),
      status: 'Ativa',
    });

    setTableName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12" id="tabelas-view">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Table className="w-4 h-4 text-[#007A78]" />
            <span>Coeficientes e Tabelas Vigentes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors flex items-center gap-1.5"
              id="export-tabelas-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
                id="add-tabela-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Tabela</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter inputs */}
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
            <option value="ALL">Todos os Bancos</option>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTabelas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
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
                      <span className="px-2 py-0.5 bg-teal-100 text-[#007A78] font-extrabold text-[10px] rounded-full uppercase">
                        {tab.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#007A78]" />
              <span>Nova Tabela de Comissão</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco</label>
                <select
                  required
                  value={bancoId}
                  onChange={(e) => setBancoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  <option value="">Selecione o Banco</option>
                  {bancos.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Produto / Operação</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faixa de Valor</label>
                <input
                  type="text"
                  value={valueRange}
                  onChange={(e) => setValueRange(e.target.value)}
                  placeholder="Ex: R$ 1.000,00 a R$ 50.000,00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Máx Parcelas</label>
                  <input
                    type="number"
                    value={maxInstallments}
                    onChange={(e) => setMaxInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>
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
                  className="px-4 py-2 bg-[#007A78] hover:bg-[#005B58] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Salvar Tabela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
