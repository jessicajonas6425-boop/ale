import React, { useState } from 'react';
import { Logo } from './Logo';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setErrorMsg('Por favor, preencha e-mail e senha.');
      return;
    }

    // Admin Credentials Check
    if (trimmedEmail === 'alexandrita@x.com' || trimmedEmail === 'admin@grupoalexandrita.com.br') {
      if (password !== 'alexandrita4321') {
        setErrorMsg('Senha incorreta para a conta de Administrador.');
        return;
      }

      onLoginSuccess({
        id: 'admin-alexandrita-id',
        uid: 'admin-alexandrita-uid',
        name: 'Ana Carolina Alexandrita (Admin)',
        email: trimmedEmail,
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        role: 'admin',
        status: 'ATIVO',
        createdAt: new Date().toISOString(),
        referralCode: 'ALEX-ADMIN',
        payoutInfo: { pixKey: 'alexandrita@x.com', bankName: 'Banco Pan' }
      });
      return;
    }

    // Standard Corretor Login / Registration
    if (password.length < 4) {
      setErrorMsg('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    onLoginSuccess({
      id: `user-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      name: name || (trimmedEmail.split('@')[0] + ' (Corretor)'),
      email: trimmedEmail,
      cpf: cpf || '234.567.890-11',
      phone: phone || '(11) 99999-8888',
      role: 'corretor',
      status: 'ATIVO',
      createdAt: new Date().toISOString(),
      referralCode: `ALEX-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  return (
    <div className="min-h-screen bg-[#001D1C] bg-gradient-to-br from-[#002B2A] via-[#003836] to-[#001716] flex items-center justify-center p-4 relative overflow-hidden" id="login-screen">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007A78]/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3CE5DB]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Card Header with Logo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <Logo size="xl" />
          </div>
          <p className="text-teal-200/80 text-xs font-bold uppercase tracking-widest">
            CRM Consignado & Plataforma de Operações
          </p>
        </div>

        {/* Login / Register Card */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-teal-100 text-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isRegister ? 'Cadastrar Novo Corretor' : 'Acesse sua Conta'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRegister
                ? 'Preencha seus dados para criar sua conta no Grupo Alexandrita'
                : 'Digite suas credenciais de acesso corporativo'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexandrita@x.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] focus:bg-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#007A78] to-[#005B58] text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              id="submit-login-btn"
            >
              <span>{isRegister ? 'Concluir Cadastro' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Toggle Register */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-[#007A78] hover:underline"
            >
              {isRegister ? 'Já possui uma conta? Faça login' : 'Não tem conta? Cadastre-se como corretor'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-teal-200/60 font-medium">
          © {new Date().getFullYear()} Grupo Alexandrita — Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
