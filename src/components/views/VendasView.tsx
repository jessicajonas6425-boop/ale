import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Filter, 
  Eye, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  DollarSign,
  User,
  Building2,
  Calendar,
  Hash
} from 'lucide-react';
import { Venda, VendaStatus, Banco, UserProfile } from '../../types';
import { exportToExcel } from '../../lib/exportToExcel';

interface VendasViewProps {
  vendas: Venda[];
  bancos: Banco[];
  currentUser: UserProfile;
  vendedores: UserProfile[];
  onAddVenda: (venda: Omit<Venda, 'id'>) => void;
  onUpdateVendaStatus?: (vendaId: string, status: VendaStatus) => void;
}

export const VendasView: React.FC<VendasViewProps> = ({
  vendas,
  bancos,
  currentUser,
  vendedores,
  onAddVenda,
  onUpdateVendaStatus
}) => {
  // Filters
  const [filterCorretor, setFilterCorretor] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBanco, setFilterBanco] = useState<string>('ALL');
  const [searchCpf, setSearchCpf] = useState('');
  
  // Selected sale for detail modal
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  // New Sale Modal
  const [showNovaVendaModal, setShowNovaVendaModal] = useState(false);
  const [contractNumber, setContractNumber] = useState('');
  const [bancoId, setBancoId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [product, setProduct] = useState('INSS Novo');
  const [amount, setAmount] = useState<number | ''>('');
  const [installments, setInstallments] = useState(84);
  const [corretorIdSelected, setCorretorIdSelected] = useState(currentUser.uid);

  // Filter logic
  const filteredVendas = vendas.filter((v) => {
    // If corretor, show only their sales unless admin
    if (currentUser.role !== 'admin' && v.corretorId !== currentUser.uid && v.corretorName !== currentUser.name) {
      return false;
    }

    if (filterCorretor !== 'ALL' && v.corretorId !== filterCorretor && v.corretorName !== filterCorretor) {
      return false;
    }

    if (filterStatus !== 'ALL' && v.status !== filterStatus) {
      return false;
    }

    if (filterBanco !== 'ALL' && v.bancoId !== filterBanco && v.bancoName !== filterBanco) {
      return false;
    }

    if (searchCpf.trim() !== '') {
      const q = searchCpf.toLowerCase();
      const matchCpf = v.customerCpf.toLowerCase().includes(q);
      const matchName = v.customerName.toLowerCase().includes(q);
      const matchCtr = v.contractNumber.toLowerCase().includes(q);
      if (!matchCpf && !matchName && !matchCtr) return false;
    }

    return true;
  });

  const getStatusBadge = (status: VendaStatus) => {
    switch (status) {
      case 'Pago':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago</span>;
      case 'Aprovado':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Aprovado</span>;
      case 'Em Análise':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> Em Análise</span>;
      case 'Aguardando Digitação':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-600" /> Aguardando</span>;
      case 'Pendente Documento':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-orange-600" /> Pend. Doc</span>;
      case 'Cancelado':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300/60 rounded-lg text-xs font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-600" /> Cancelado</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  const handleExport = () => {
    const exportData = filteredVendas.map((v) => ({
      'Nº Contrato': v.contractNumber,
      'Banco': v.bancoName,
      'Cliente': v.customerName,
      'CPF Cliente': v.customerCpf,
      'Produto': v.product,
      'Valor Bruto': v.amount,
      'Valor Líquido': v.netAmount || v.amount,
      'Parcelas': v.installments,
      'Status': v.status,
      'Comissão Parceiro (R$)': v.partnerCommission,
      'Comissão Vendedor (R$)': v.vendorCommission,
      'Corretor': v.corretorName,
      'Data Venda': v.date,
    }));

    exportToExcel(exportData, 'Relatorio_Vendas_Grupo_Alexandrita', 'Vendas');
  };

  const handleCreateVenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNumber || !customerName || !amount || !bancoId) return;

    const selectedBancoObj = bancos.find((b) => b.id === bancoId || b.name === bancoId);
    const bancoNameStr = selectedBancoObj ? selectedBancoObj.name : 'Banco Pan';

    let corretorNameStr = currentUser.name;
    if (currentUser.role === 'admin' && corretorIdSelected) {
      const foundVendedor = vendedores.find(v => v.uid === corretorIdSelected || v.id === corretorIdSelected);
      if (foundVendedor) corretorNameStr = foundVendedor.name;
    }

    const valNum = Number(amount);
    // Calculated estimate comission ~ 12% total, vendor ~ 8%
    const partnerComm = Math.round(valNum * 0.12 * 100) / 100;
    const vendorComm = Math.round(valNum * 0.08 * 100) / 100;

    onAddVenda({
      contractNumber,
      bancoId: bancoId || 'banco-pan',
      bancoName: bancoNameStr,
      corretorId: currentUser.role === 'admin' ? corretorIdSelected : currentUser.uid,
      corretorName: corretorNameStr,
      customerName,
      customerCpf: customerCpf || '000.000.000-00',
      product,
      amount: valNum,
      netAmount: valNum,
      installments: Number(installments),
      status: 'Em Análise',
      partnerCommission: partnerComm,
      vendorCommission: vendorComm,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    setContractNumber('');
    setCustomerName('');
    setCustomerCpf('');
    setAmount('');
    setShowNovaVendaModal(false);
  };

  const formatCurrency = (val: number) => {
    return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
  };

  return (
    <div className="space-y-6 pb-12" id="vendas-view">
      {/* Filters Bar & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-[#007A78]" />
            <span>Filtros de Propostas e Vendas</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors flex items-center gap-1.5"
              id="export-vendas-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => setShowNovaVendaModal(true)}
              className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
              id="nova-venda-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Venda</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CPF or Name Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar CPF, cliente ou contrato..."
              value={searchCpf}
              onChange={(e) => setSearchCpf(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#007A78] outline-none"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#007A78] outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Pago">Pago</option>
            <option value="Aguardando Digitação">Aguardando Digitação</option>
            <option value="Pendente Documento">Pendente Documento</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          {/* Filter Banco */}
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

          {/* Filter Corretor (Admin only) */}
          {currentUser.role === 'admin' ? (
            <select
              value={filterCorretor}
              onChange={(e) => setFilterCorretor(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#007A78] outline-none"
            >
              <option value="ALL">Todos os Corretores</option>
              {vendedores.map((v) => (
                <option key={v.id || v.uid} value={v.uid || v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#007A78]" />
              <span>Suas Vendas ({currentUser.name.split(' ')[0]})</span>
            </div>
          )}
        </div>
      </div>

      {/* Sales Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVendas.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-teal-200">
            <p className="text-sm font-semibold text-slate-500">Nenhuma venda encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          filteredVendas.map((venda) => (
            <div
              key={venda.id}
              className="bg-white rounded-2xl border border-teal-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#007A78]">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{venda.contractNumber}</span>
                  </div>
                  {getStatusBadge(venda.status)}
                </div>

                {/* Main Sale details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Banco:</span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#007A78]" />
                      {venda.bancoName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Cliente:</span>
                    <span className="text-xs font-extrabold text-slate-800 truncate max-w-[180px]">
                      {venda.customerName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">CPF:</span>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {venda.customerCpf}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Produto:</span>
                    <span className="text-xs font-bold text-[#007A78] bg-teal-50 px-2 py-0.5 rounded">
                      {venda.product} ({venda.installments}x)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Valor Operação:</span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(venda.amount)}
                    </span>
                  </div>

                  {/* Commissions breakdown */}
                  <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-100/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Comissão Parceiro:</span>
                      <strong className="text-slate-800">{formatCurrency(venda.partnerCommission)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#007A78]">
                      <span>Comissão Corretor:</span>
                      <strong className="text-emerald-600 font-extrabold">{formatCurrency(venda.vendorCommission)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {venda.date}
                </span>

                <button
                  onClick={() => setSelectedVenda(venda)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-[#007A78] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detalhes</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedVenda && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Detalhes do Contrato</h3>
                <p className="text-xs text-[#007A78] font-bold">{selectedVenda.contractNumber}</p>
              </div>
              {getStatusBadge(selectedVenda.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-500 font-medium">Cliente</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedVenda.customerName}</p>
                <p className="text-slate-600 font-mono mt-0.5">{selectedVenda.customerCpf}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-500 font-medium">Banco & Produto</p>
                <p className="font-bold text-[#007A78] text-sm mt-0.5">{selectedVenda.bancoName}</p>
                <p className="text-slate-600 font-semibold">{selectedVenda.product} - {selectedVenda.installments}x</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 font-medium">Valor Total Liberado</p>
                <p className="font-black text-emerald-800 text-base mt-0.5">{formatCurrency(selectedVenda.amount)}</p>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-teal-700 font-medium">Comissão do Vendedor</p>
                <p className="font-black text-[#007A78] text-base mt-0.5">{formatCurrency(selectedVenda.vendorCommission)}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Corretor Responsável:</span>
                <span className="font-bold text-slate-800">{selectedVenda.corretorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data de Cadastro:</span>
                <span className="font-semibold text-slate-700">{selectedVenda.date}</span>
              </div>
            </div>

            {/* Admin status switcher */}
            {currentUser.role === 'admin' && onUpdateVendaStatus && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">Atualizar Status (Admin)</label>
                <select
                  value={selectedVenda.status}
                  onChange={(e) => {
                    const newSt = e.target.value as VendaStatus;
                    onUpdateVendaStatus(selectedVenda.id, newSt);
                    setSelectedVenda({ ...selectedVenda, status: newSt });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:border-[#007A78] outline-none"
                >
                  <option value="Aguardando Digitação">Aguardando Digitação</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente Documento">Pendente Documento</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVenda(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nova Venda Modal */}
      {showNovaVendaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#007A78]" />
              <span>Lançar Nova Venda</span>
            </h3>

            <form onSubmit={handleCreateVenda} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº do Contrato / Proposta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CTR-99201"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco Operado</label>
                <select
                  required
                  value={bancoId}
                  onChange={(e) => setBancoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  <option value="">Selecione o Banco</option>
                  {bancos.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Cód {b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do tomador"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF do Cliente</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={customerCpf}
                    onChange={(e) => setCustomerCpf(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produto</label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  >
                    <option value="INSS Novo">INSS Novo</option>
                    <option value="Refinanciamento INSS">Refinanciamento INSS</option>
                    <option value="Portabilidade">Portabilidade</option>
                    <option value="Saque Aniversário FGTS">Saque Aniversário FGTS</option>
                    <option value="Cartão Benefício">Cartão Benefício</option>
                    <option value="BPC / LOAS">BPC / LOAS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Bruto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº Parcelas</label>
                  <input
                    type="number"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>
              </div>

              {currentUser.role === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Atribuir a Corretor</label>
                  <select
                    value={corretorIdSelected}
                    onChange={(e) => setCorretorIdSelected(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  >
                    {vendedores.map((v) => (
                      <option key={v.id || v.uid} value={v.uid || v.id}>
                        {v.name} ({v.cpf})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovaVendaModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A78] hover:bg-[#005B58] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
