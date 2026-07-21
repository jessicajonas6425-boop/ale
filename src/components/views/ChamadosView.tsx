import React, { useState } from 'react';
import { 
  KeyRound, 
  RotateCcw, 
  RefreshCw, 
  PlusCircle, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { Chamado, ChamadoType, ChamadoStatus, UserProfile } from '../../types';

interface ChamadosViewProps {
  chamados: Chamado[];
  currentUser: UserProfile;
  onAddChamado: (chamado: Omit<Chamado, 'id'>) => void;
  onUpdateChamado?: (id: string, status: ChamadoStatus, resolution?: string) => void;
}

export const ChamadosView: React.FC<ChamadosViewProps> = ({
  chamados,
  currentUser,
  onAddChamado,
  onUpdateChamado
}) => {
  // Modal for new ticket
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ChamadoType>('Solicitar Login');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');

  // Modal for ticket resolution (Admin view)
  const [activeTicket, setActiveTicket] = useState<Chamado | null>(null);
  const [adminResolutionText, setAdminResolutionText] = useState('');
  const [adminStatusSelected, setAdminStatusSelected] = useState<ChamadoStatus>('Fechado');

  // Filter chamados based on user role
  const userChamados = currentUser.role === 'admin' 
    ? chamados 
    : chamados.filter(c => c.corretorId === currentUser.uid || c.corretorName === currentUser.name);

  const openQuickModal = (type: ChamadoType) => {
    setSelectedType(type);
    setTitle(`${type} - ${new Date().toLocaleDateString('pt-BR')}`);
    setShowModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const nextTicketNum = `TKT-${1040 + userChamados.length + Math.floor(Math.random() * 50)}`;

    onAddChamado({
      ticketNumber: nextTicketNum,
      type: selectedType,
      corretorId: currentUser.uid,
      corretorName: currentUser.name,
      title,
      description,
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      priority,
    });

    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !onUpdateChamado) return;

    onUpdateChamado(activeTicket.id, adminStatusSelected, adminResolutionText);
    setActiveTicket(null);
    setAdminResolutionText('');
  };

  const getStatusBadge = (status: ChamadoStatus) => {
    switch (status) {
      case 'Aberto':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Aberto
          </span>
        );
      case 'Em Andamento':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-extrabold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Em Andamento
          </span>
        );
      case 'Fechado':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fechado
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12" id="chamados-view">
      {/* Quick Action Top Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => openQuickModal('Solicitar Login')}
          className="p-4 bg-white hover:bg-teal-50 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-xs transition-all text-left flex items-center gap-3 group"
          id="btn-solicitar-login"
        >
          <div className="p-3 bg-teal-100 text-[#007A78] rounded-xl group-hover:bg-[#007A78] group-hover:text-white transition-colors">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Solicitar Login</h4>
            <p className="text-[11px] text-slate-500">Acesso a novas esteiras</p>
          </div>
        </button>

        <button
          onClick={() => openQuickModal('Reset de Senha')}
          className="p-4 bg-white hover:bg-teal-50 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-xs transition-all text-left flex items-center gap-3 group"
          id="btn-reset-senha"
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Reset de Senha</h4>
            <p className="text-[11px] text-slate-500">Desbloqueio de usuários</p>
          </div>
        </button>

        <button
          onClick={() => openQuickModal('Reapresentar Proposta')}
          className="p-4 bg-white hover:bg-teal-50 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-xs transition-all text-left flex items-center gap-3 group"
          id="btn-reapresentar-proposta"
        >
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Reapresentar Proposta</h4>
            <p className="text-[11px] text-slate-500">Pendências e recast</p>
          </div>
        </button>

        <button
          onClick={() => openQuickModal('Novo Chamado')}
          className="p-4 bg-gradient-to-r from-[#007A78] to-[#005B58] text-white rounded-2xl shadow-md transition-all text-left flex items-center gap-3 group hover:opacity-95"
          id="btn-novo-chamado"
        >
          <div className="p-3 bg-white/20 rounded-xl">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">Novo Chamado</h4>
            <p className="text-[11px] text-teal-100">Suporte técnico direto</p>
          </div>
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-teal-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#007A78]" />
            <h3 className="font-bold text-slate-900 text-base">Histórico de Chamados & Tickets</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total: {userChamados.length} chamados
          </span>
        </div>

        <div className="space-y-3">
          {userChamados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              Nenhum chamado aberto. Utilize os botões acima para abrir uma nova solicitação.
            </div>
          ) : (
            userChamados.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#007A78] text-xs bg-teal-100 px-2.5 py-1 rounded-lg">
                      {ticket.ticketNumber}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{ticket.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTicket(ticket);
                          setAdminResolutionText(ticket.resolution || '');
                          setAdminStatusSelected(ticket.status);
                        }}
                        className="px-3 py-1 bg-[#007A78] hover:bg-[#005B58] text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        Atender
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {ticket.description}
                </p>

                {ticket.resolution && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                    <div className="font-extrabold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resolução do Suporte:</span>
                    </div>
                    <p className="text-emerald-900 font-medium">{ticket.resolution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <User className="w-3 h-3 text-[#007A78]" />
                    Solicitante: {ticket.corretorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#007A78]" />
              <span>Abrir Chamado: {selectedType}</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Solicitação</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ChamadoType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  <option value="Solicitar Login">Solicitar Login em Banco</option>
                  <option value="Reset de Senha">Reset de Senha / Desbloqueio</option>
                  <option value="Reapresentar Proposta">Reapresentar Proposta</option>
                  <option value="Novo Chamado">Outra Solicitação</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assunto / Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Liberação de acesso Itaú Consignado"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Baixa' | 'Média' | 'Alta')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta (Urgente)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva com detalhes a sua necessidade ou pendência do contrato..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                ></textarea>
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
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Resolve Ticket Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Atender Ticket {activeTicket.ticketNumber}</h3>
            <p className="text-xs text-slate-500 mb-4">{activeTicket.title} - Solicitado por: {activeTicket.corretorName}</p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status do Ticket</label>
                <select
                  value={adminStatusSelected}
                  onChange={(e) => setAdminStatusSelected(e.target.value as ChamadoStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-bold"
                >
                  <option value="Aberto">Aberto (Aguardando)</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Fechado">Fechado (Concluído)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resposta / Resolução para o Corretor</label>
                <textarea
                  rows={4}
                  required
                  value={adminResolutionText}
                  onChange={(e) => setAdminResolutionText(e.target.value)}
                  placeholder="Informe a solução, nova senha ou instrução ao corretor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
