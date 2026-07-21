import React, { useState } from 'react';
import { Users, FileSpreadsheet, Plus, Percent, Share2, Search, CheckCircle2, UserCheck, Phone, Mail, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { UserProfile } from '../../types';
import { exportToExcel } from '../../lib/exportToExcel';

interface VendedoresViewProps {
  vendedores: UserProfile[];
  currentUser: UserProfile;
  onAddVendedor?: (vendedor: Omit<UserProfile, 'id'>) => void;
  onUpdateVendedor?: (vendedorId: string, updatedData: Partial<UserProfile>) => void;
  onDeleteVendedor?: (vendedorId: string) => void;
  onClearData?: () => void;
  onToggleVendedorStatus?: (uid: string) => void;
}

export const VendedoresView: React.FC<VendedoresViewProps> = ({
  vendedores,
  currentUser,
  onAddVendedor,
  onUpdateVendedor,
  onDeleteVendedor,
  onClearData,
  onToggleVendedorStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for New Vendor
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Modal State for Edit Vendor
  const [editingVendedor, setEditingVendedor] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'corretor'>('corretor');
  const [editStatus, setEditStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');

  // Commissions Modal
  const [selectedVendedorComm, setSelectedVendedorComm] = useState<UserProfile | null>(null);
  const [selectedVendedorRef, setSelectedVendedorRef] = useState<UserProfile | null>(null);

  const filtered = vendedores.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cpf.includes(searchTerm) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filtered.map((v) => ({
      Nome: v.name,
      CPF: v.cpf,
      Email: v.email,
      Celular: v.phone,
      Status: v.status,
      Função: v.role,
      'Código Indicação': v.referralCode || 'ALEX2025',
      'Data Cadastro': v.createdAt ? new Date(v.createdAt).toLocaleDateString('pt-BR') : '-',
    }));

    exportToExcel(exportData, 'Vendedores_Grupo_Alexandrita', 'Corretores');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cpf || !onAddVendedor) return;

    onAddVendedor({
      uid: `uid-${Date.now()}`,
      name,
      email,
      cpf,
      phone: phone || '(11) 99999-0000',
      role: 'corretor',
      status: 'ATIVO',
      createdAt: new Date().toISOString(),
      referralCode: `ALEX-${name.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      payoutInfo: { pixKey: cpf }
    });

    setName('');
    setEmail('');
    setCpf('');
    setPhone('');
    setShowModal(false);
  };

  const openEditModal = (v: UserProfile) => {
    setEditingVendedor(v);
    setEditName(v.name);
    setEditEmail(v.email);
    setEditCpf(v.cpf);
    setEditPhone(v.phone);
    setEditRole(v.role);
    setEditStatus(v.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendedor || !onUpdateVendedor) return;

    const targetId = editingVendedor.id || editingVendedor.uid;
    onUpdateVendedor(targetId, {
      name: editName,
      email: editEmail,
      cpf: editCpf,
      phone: editPhone,
      role: editRole,
      status: editStatus
    });

    setEditingVendedor(null);
  };

  return (
    <div className="space-y-6 pb-12" id="vendedores-view">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-[#007A78] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Corretores e Vendedores</h3>
              <p className="text-xs text-slate-500">Gestão da equipe de vendas e comissionamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors flex items-center gap-1.5"
              id="export-vendedores-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>

            {currentUser.role === 'admin' && onClearData && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja zerar todas as vendas e vendedores cadastrados?')) {
                    onClearData();
                  }
                }}
                className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition-colors flex items-center gap-1.5"
                title="Zerar lista de vendedores e vendas"
              >
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Zerar Sistema</span>
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
                id="add-vendedor-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Corretor</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#007A78] outline-none"
          />
        </div>
      </div>

      {/* Vendedores Table */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#002B2A] text-white font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nome do Corretor</th>
                <th className="py-3.5 px-4">CPF</th>
                <th className="py-3.5 px-4">Contato</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Data Cadastro</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Nenhum corretor ou vendedor cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id || v.uid} className="hover:bg-teal-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007A78] to-[#005B58] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <div>{v.name}</div>
                        <div className="text-[10px] text-[#007A78] uppercase font-semibold">{v.role}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {v.cpf}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-3 h-3 text-[#007A78]" />
                        {v.email}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {v.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 font-extrabold text-[10px] rounded-full ${
                        v.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão Comissão */}
                        <button
                          onClick={() => setSelectedVendedorComm(v)}
                          className="px-2.5 py-1.5 bg-teal-100 hover:bg-[#007A78] hover:text-white text-[#007A78] font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          title="Ver Repasse de Comissões"
                        >
                          <Percent className="w-3 h-3" />
                          <span>Comissão</span>
                        </button>

                        {/* Botão Indicação */}
                        <button
                          onClick={() => setSelectedVendedorRef(v)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          title="Link de Indicação"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Indicação</span>
                        </button>

                        {/* Botão Editar (Admin) */}
                        {currentUser.role === 'admin' && onUpdateVendedor && (
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors"
                            title="Editar Corretor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Botão Excluir (Admin) */}
                        {currentUser.role === 'admin' && onDeleteVendedor && (
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover o corretor "${v.name}"?`)) {
                                onDeleteVendedor(v.id || v.uid);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
                            title="Remover Corretor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Comissão Vendedor */}
      {selectedVendedorComm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Configuração de Comissão — {selectedVendedorComm.name}</h3>
            <div className="p-4 bg-teal-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Repasse Padrão INSS Novo:</span>
                <strong className="text-[#007A78]">8.0% do valor liberado</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Repasse Refinanciamento:</span>
                <strong className="text-[#007A78]">7.0% do valor liberado</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Repasse FGTS Saque:</span>
                <strong className="text-[#007A78]">7.5% da antecipação</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-teal-200">
                <span className="text-slate-700 font-bold">Chave PIX Cadastrada:</span>
                <strong className="text-slate-900 font-mono">{selectedVendedorComm.payoutInfo?.pixKey || selectedVendedorComm.cpf}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVendedorComm(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Indicação */}
      {selectedVendedorRef && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Link de Indicação do Corretor</h3>
            <p className="text-xs text-slate-500">Compartilhe o código para vincular novos parceiros à equipe de {selectedVendedorRef.name}:</p>

            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 font-mono text-sm text-center font-black text-[#007A78]">
              {selectedVendedorRef.referralCode || 'ALEX-REF2025'}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVendedorRef(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Cadastrar Novo Corretor</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do corretor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="corretor@grupoalexandrita.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
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
                  Salvar Corretor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVendedor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#007A78]" />
              <span>Editar Corretor</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                <input
                  type="text"
                  required
                  value={editCpf}
                  onChange={(e) => setEditCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail corporativo</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Função / Perfil</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'corretor')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none bg-white"
                  >
                    <option value="corretor">Corretor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none bg-white"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingVendedor(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A78] hover:bg-[#005B58] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Atualizar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
