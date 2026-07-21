import React, { useState } from 'react';
import { Key, Plus, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LoginBanco, Banco, UserProfile } from '../../types';

interface LoginsViewProps {
  logins: LoginBanco[];
  bancos: Banco[];
  currentUser: UserProfile;
  onAddLogin?: (login: Omit<LoginBanco, 'id'>) => void;
}

export const LoginsView: React.FC<LoginsViewProps> = ({
  logins,
  bancos,
  currentUser,
  onAddLogin
}) => {
  const [showModal, setShowModal] = useState(false);
  const [bancoName, setBancoName] = useState('Banco Pan');
  const [loginUser, setLoginUser] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser || !onAddLogin) return;

    onAddLogin({
      bancoName,
      loginUser,
      status: 'Disponível',
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setLoginUser('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12" id="logins-view">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-teal-100 shadow-xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Key className="w-5 h-5 text-[#007A78]" />
            <span>Logins de Acesso por Banco</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de credenciais cadastradas para digitação e transmissão de propostas
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
            id="novo-login-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Login</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logins.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#007A78]" />
                  {item.bancoName}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    item.status === 'Disponível'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                      : 'bg-red-100 text-red-800 border border-red-300/60'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Usuário / Operador:</div>
                <div className="font-bold text-slate-800 text-sm">{item.loginUser}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Atualizado em: {item.updatedAt}</span>
              <span className="font-semibold text-[#007A78]">Validade OK</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Cadastrar Novo Login</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco</label>
                <select
                  value={bancoName}
                  onChange={(e) => setBancoName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  {bancos.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Usuário / Operador Cadastrado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ALEXANDRITA_PAN_02"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
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
                  Salvar Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
