import React, { useState } from 'react';
import { Keyboard, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DigitacaoInterna, Banco, UserProfile } from '../../types';

interface DigitacaoViewProps {
  digitacoes: DigitacaoInterna[];
  bancos: Banco[];
  currentUser: UserProfile;
  onAddDigitacao?: (dig: Omit<DigitacaoInterna, 'id'>) => void;
}

export const DigitacaoView: React.FC<DigitacaoViewProps> = ({
  digitacoes,
  bancos,
  currentUser,
  onAddDigitacao
}) => {
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [bancoName, setBancoName] = useState('Banco Pan');
  const [product, setProduct] = useState('INSS Novo');
  const [amount, setAmount] = useState<number | ''>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerCpf || !amount || !onAddDigitacao) return;

    onAddDigitacao({
      protocolNumber: `DIG-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName,
      customerCpf,
      bancoName,
      product,
      amount: Number(amount),
      status: 'Pendente',
      corretorName: currentUser.name,
      date: new Date().toLocaleDateString('pt-BR')
    });

    setCustomerName('');
    setCustomerCpf('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12" id="digitacao-view">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-[#007A78] rounded-xl">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Digitação Interna Centralizada</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Envie as propostas de seus clientes para digitação e transmissão pela equipe operacional do Grupo Alexandrita.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#007A78] hover:bg-[#005B58] text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
          id="solicitar-digitacao-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Enviar para Digitação</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-xs p-6">
        {digitacoes.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-teal-50 text-[#007A78] rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Fila de Digitação Interna</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sua esteira de digitação está atualmente vazia. Clique no botão acima caso deseje que a mesa de operações digite propostas para você.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002B2A] text-white font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Protocolo</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Banco & Produto</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Corretor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {digitacoes.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/50">
                    <td className="py-3 px-4 font-bold text-[#007A78]">{item.protocolNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{item.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.customerCpf}</td>
                    <td className="py-3 px-4 font-semibold text-[#002B2A]">{item.bancoName} - {item.product}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">R$ {item.amount.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-slate-600">{item.corretorName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Digitação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#007A78]" />
              <span>Solicitar Digitação Interna</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banco Desejado</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Produto</label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                  >
                    <option value="INSS Novo">INSS Novo</option>
                    <option value="Refinanciamento">Refinanciamento</option>
                    <option value="Portabilidade">Portabilidade</option>
                    <option value="FGTS">FGTS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor Aproximado (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="10000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
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
                  Enviar para Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
