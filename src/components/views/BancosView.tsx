import React, { useState } from 'react';
import { ExternalLink, Search, ShieldCheck, Award, Plus, Building2, CheckCircle2, Wrench, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Banco, UserProfile } from '../../types';

interface BancosViewProps {
  bancos: Banco[];
  currentUser: UserProfile;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onAddBanco?: (banco: Omit<Banco, 'id'>) => void;
  onUpdateBancoStatus?: (bancoId: string, status: Banco['status']) => void;
  onDeleteBanco?: (bancoId: string) => void;
  onRestoreDefaultBancos?: () => void;
}

export const BancosView: React.FC<BancosViewProps> = ({
  bancos,
  currentUser,
  searchTerm,
  setSearchTerm,
  onAddBanco,
  onUpdateBancoStatus,
  onDeleteBanco,
  onRestoreDefaultBancos
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [category, setCategory] = useState('Consignado INSS & FGTS');
  const [position, setPosition] = useState(bancos.length + 1);
  const [certificationRequired, setCertificationRequired] = useState(true);

  const filteredBancos = bancos.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.includes(searchTerm) ||
      (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.position - b.position);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !loginUrl || !onAddBanco) return;

    onAddBanco({
      name,
      code: code || '000',
      loginUrl: loginUrl.startsWith('http') ? loginUrl : `https://${loginUrl}`,
      status: 'ATIVO',
      position: Number(position),
      certificationRequired,
      category
    });

    setName('');
    setCode('');
    setLoginUrl('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12" id="bancos-view">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-teal-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar banco por nome, código ou modalidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#007A78] focus:ring-2 focus:ring-teal-100 rounded-xl text-sm text-slate-800 transition-all outline-none"
            id="bancos-search-input"
          />
        </div>

        {currentUser.role === 'admin' && (
          <div className="flex items-center gap-2">
            {onRestoreDefaultBancos && (
              <button
                onClick={() => {
                  if (confirm('Deseja atualizar/restaurar a lista oficial dos 18 bancos?')) {
                    onRestoreDefaultBancos();
                  }
                }}
                className="px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#007A78] border border-teal-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                title="Restaurar Lista Oficial dos 18 Bancos"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Lista Oficial</span>
              </button>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              id="add-banco-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Banco</span>
            </button>
          </div>
        )}
      </div>

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBancos.map((banco) => (
          <div
            key={banco.id}
            className="bg-white rounded-2xl border border-teal-100 p-5 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-teal-100 text-[#007A78] text-[11px] font-extrabold rounded-lg tracking-wider">
                  POSIÇÃO #{banco.position}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      banco.status === 'ATIVO'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/50'
                        : banco.status === 'MANUTENÇÃO'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300/50'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {banco.status === 'ATIVO' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {banco.status === 'MANUTENÇÃO' && <Wrench className="w-3 h-3 text-amber-600" />}
                    {banco.status}
                  </span>
                </div>
              </div>

              {/* Bank Name & Code */}
              <div className="flex items-start gap-3 my-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#007A78] to-[#005B58] text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                  {banco.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-[#007A78] transition-colors">
                    {banco.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Cód. Febraban: <strong className="text-slate-800">{banco.code}</strong>
                  </p>
                  <p className="text-[11px] text-[#007A78] font-medium mt-1">
                    {banco.category || 'Consignado Geral'}
                  </p>
                </div>
              </div>

              {/* Certification Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Certificação ANEPS / Febraban</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {banco.certificationRequired ? 'Obrigatória' : 'Isento'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={banco.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#007A78] hover:bg-[#005B58] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Acessar Login Banco</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {currentUser.role === 'admin' && onUpdateBancoStatus && (
                <button
                  onClick={() =>
                    onUpdateBancoStatus(
                      banco.id,
                      banco.status === 'ATIVO' ? 'MANUTENÇÃO' : 'ATIVO'
                    )
                  }
                  className="p-2 border border-slate-200 hover:bg-teal-50 rounded-xl text-slate-600 transition-colors"
                  title="Alternar Status Ativo / Manutenção"
                >
                  <Edit3 className="w-4 h-4 text-[#007A78]" />
                </button>
              )}

              {currentUser.role === 'admin' && onDeleteBanco && (
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover o banco "${banco.name}"?`)) {
                      onDeleteBanco(banco.id);
                    }
                  }}
                  className="p-2 border border-red-200 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                  title="Remover Banco"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Modal Cadastrar Banco */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#007A78]" />
              <span>Novo Banco Parceiro</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Banco</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banco Master"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código Febraban</label>
                  <input
                    type="text"
                    placeholder="Ex: 243"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Posição no Ranking</label>
                  <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link Direto de Login</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={loginUrl}
                  onChange={(e) => setLoginUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidades Principais</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: INSS, FGTS, Cartão"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="certCheck"
                  checked={certificationRequired}
                  onChange={(e) => setCertificationRequired(e.target.checked)}
                  className="w-4 h-4 text-[#007A78] rounded accent-[#007A78]"
                />
                <label htmlFor="certCheck" className="text-xs font-semibold text-slate-700">
                  Exige Certificação de Promotor (Febraban / ANEPS)
                </label>
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
                  Salvar Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
