import React, { useState } from 'react';
import { UserCircle, UploadCloud, CheckCircle2, Save, FileCheck, Shield, CreditCard, MapPin, Camera } from 'lucide-react';
import { UserProfile } from '../../types';

interface MeuPerfilViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
}

export const MeuPerfilView: React.FC<MeuPerfilViewProps> = ({
  currentUser,
  onUpdateProfile
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [cpf, setCpf] = useState(currentUser.cpf || '');
  const [rg, setRg] = useState(currentUser.rg || '12.345.678-9');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');

  // Address
  const [cep, setCep] = useState(currentUser.address?.cep || '01001-000');
  const [street, setStreet] = useState(currentUser.address?.street || 'Avenida Paulista');
  const [number, setNumber] = useState(currentUser.address?.number || '1000');
  const [neighborhood, setNeighborhood] = useState(currentUser.address?.neighborhood || 'Bela Vista');
  const [city, setCity] = useState(currentUser.address?.city || 'São Paulo');
  const [state, setState] = useState(currentUser.address?.state || 'SP');

  // Bank payout info
  const [pixKey, setPixKey] = useState(currentUser.payoutInfo?.pixKey || currentUser.email || '');
  const [bankName, setBankName] = useState(currentUser.payoutInfo?.bankName || 'Banco Pan');
  const [agency, setAgency] = useState(currentUser.payoutInfo?.agency || '0001');
  const [account, setAccount] = useState(currentUser.payoutInfo?.account || '12345-6');

  // Documents state (simulated or base64 / blob URLs)
  const [selfie, setSelfie] = useState<string | null>(currentUser.documents?.selfieUrl || null);
  const [rgFrente, setRgFrente] = useState<string | null>(currentUser.documents?.rgFrenteUrl || null);
  const [rgVerso, setRgVerso] = useState<string | null>(currentUser.documents?.rgVersoUrl || null);
  const [comprovante, setComprovante] = useState<string | null>(currentUser.documents?.comprovanteUrl || null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      cpf,
      rg,
      phone,
      email,
      address: { cep, street, number, neighborhood, city, state },
      payoutInfo: { pixKey, bankName, agency, account },
      documents: {
        selfieUrl: selfie || undefined,
        rgFrenteUrl: rgFrente || undefined,
        rgVersoUrl: rgVerso || undefined,
        comprovanteUrl: comprovante || undefined,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12" id="meu-perfil-view">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#007A78] to-[#005B58] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2.5 py-0.5 bg-teal-100 text-[#007A78] font-extrabold text-[10px] rounded-full uppercase">
                {currentUser.role === 'admin' ? 'ADMINISTRADOR' : 'CORRETOR AUTORIZADO'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Status: {currentUser.status}</span>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perfil Atualizado com Sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Personal Info */}
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCircle className="w-5 h-5 text-[#007A78]" />
            <span>Dados Pessoais do Usuário</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
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
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RG com Órgão Emissor</label>
              <input
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código de Indicação</label>
              <input
                type="text"
                disabled
                value={currentUser.referralCode || 'ALEX-2025'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-[#007A78]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-[#007A78]" />
            <span>Endereço Residencial / Comercial</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CEP</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Rua</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payout Banking */}
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-[#007A78]" />
            <span>Dados Bancários para Repasse de Comissões</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Chave PIX Principal</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, E-mail ou Telefone"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none font-semibold text-[#007A78]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Banco</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#007A78] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agência / Conta</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Agência"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-slate-300 rounded-xl text-xs focus:border-[#007A78] outline-none"
                />
                <input
                  type="text"
                  placeholder="Conta com dígito"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-slate-300 rounded-xl text-xs focus:border-[#007A78] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Document Uploads */}
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#007A78]" />
                <span>Documentação Pessoal (Compliance)</span>
              </h3>
              <p className="text-xs text-slate-500">Envie cópias legíveis para homologação nos bancos parceiros</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Selfie */}
            <div className="p-4 bg-slate-50 border border-dashed border-teal-200 rounded-2xl text-center flex flex-col justify-between space-y-3">
              <div>
                <Camera className="w-6 h-6 text-[#007A78] mx-auto mb-1" />
                <span className="font-bold text-slate-800 text-xs block">Selfie com Documento</span>
                <p className="text-[10px] text-slate-400">Rosto claro segurando o documento ao lado</p>
              </div>

              {selfie ? (
                <div className="relative group">
                  <img src={selfie} alt="Selfie" className="w-full h-28 object-cover rounded-xl border border-teal-300" />
                  <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full text-[9px] font-bold">
                    OK
                  </span>
                </div>
              ) : (
                <div className="py-4 text-[11px] text-slate-400">Nenhum arquivo enviado</div>
              )}

              <label className="cursor-pointer px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#007A78] font-bold text-xs rounded-xl transition-colors block">
                <span>Enviar Selfie</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSelfie)} className="hidden" />
              </label>
            </div>

            {/* RG Frente */}
            <div className="p-4 bg-slate-50 border border-dashed border-teal-200 rounded-2xl text-center flex flex-col justify-between space-y-3">
              <div>
                <UploadCloud className="w-6 h-6 text-[#007A78] mx-auto mb-1" />
                <span className="font-bold text-slate-800 text-xs block">RG (Frente)</span>
                <p className="text-[10px] text-slate-400">Frente do documento com foto</p>
              </div>

              {rgFrente ? (
                <div className="relative group">
                  <img src={rgFrente} alt="RG Frente" className="w-full h-28 object-cover rounded-xl border border-teal-300" />
                  <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full text-[9px] font-bold">
                    OK
                  </span>
                </div>
              ) : (
                <div className="py-4 text-[11px] text-slate-400">Nenhum arquivo enviado</div>
              )}

              <label className="cursor-pointer px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#007A78] font-bold text-xs rounded-xl transition-colors block">
                <span>Enviar RG Frente</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setRgFrente)} className="hidden" />
              </label>
            </div>

            {/* RG Verso */}
            <div className="p-4 bg-slate-50 border border-dashed border-teal-200 rounded-2xl text-center flex flex-col justify-between space-y-3">
              <div>
                <UploadCloud className="w-6 h-6 text-[#007A78] mx-auto mb-1" />
                <span className="font-bold text-slate-800 text-xs block">RG (Verso)</span>
                <p className="text-[10px] text-slate-400">Verso com CPF e números</p>
              </div>

              {rgVerso ? (
                <div className="relative group">
                  <img src={rgVerso} alt="RG Verso" className="w-full h-28 object-cover rounded-xl border border-teal-300" />
                  <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full text-[9px] font-bold">
                    OK
                  </span>
                </div>
              ) : (
                <div className="py-4 text-[11px] text-slate-400">Nenhum arquivo enviado</div>
              )}

              <label className="cursor-pointer px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#007A78] font-bold text-xs rounded-xl transition-colors block">
                <span>Enviar RG Verso</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setRgVerso)} className="hidden" />
              </label>
            </div>

            {/* Comprovante */}
            <div className="p-4 bg-slate-50 border border-dashed border-teal-200 rounded-2xl text-center flex flex-col justify-between space-y-3">
              <div>
                <UploadCloud className="w-6 h-6 text-[#007A78] mx-auto mb-1" />
                <span className="font-bold text-slate-800 text-xs block">Comprovante de Residência</span>
                <p className="text-[10px] text-slate-400">Conta de luz/água dos últimos 90 dias</p>
              </div>

              {comprovante ? (
                <div className="relative group">
                  <img src={comprovante} alt="Comprovante" className="w-full h-28 object-cover rounded-xl border border-teal-300" />
                  <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full text-[9px] font-bold">
                    OK
                  </span>
                </div>
              ) : (
                <div className="py-4 text-[11px] text-slate-400">Nenhum arquivo enviado</div>
              )}

              <label className="cursor-pointer px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#007A78] font-bold text-xs rounded-xl transition-colors block">
                <span>Enviar Comprovante</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setComprovante)} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#007A78] to-[#005B58] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            id="save-profile-btn"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações do Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
