export type UserRole = 'admin' | 'corretor';

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  cpf: string;
  rg?: string;
  phone: string;
  role: UserRole;
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE';
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  payoutInfo?: {
    pixKey?: string;
    bankName?: string;
    agency?: string;
    account?: string;
  };
  documents?: {
    selfieUrl?: string;
    rgFrenteUrl?: string;
    rgVersoUrl?: string;
    comprovanteUrl?: string;
  };
  referralCode?: string;
  password?: string;
  createdAt: string;
}

export interface Banco {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  loginUrl: string;
  status: 'ATIVO' | 'MANUTENÇÃO' | 'INATIVO';
  position: number;
  certificationRequired: boolean;
  category?: string;
  defaultCommission?: number;
}

export type VendaStatus = 
  | 'Aguardando Digitação'
  | 'Em Análise'
  | 'Aprovado'
  | 'Pago'
  | 'Cancelado'
  | 'Pendente Documento';

export interface Venda {
  id: string;
  contractNumber: string;
  bancoId: string;
  bancoName: string;
  corretorId: string;
  corretorName: string;
  customerName: string;
  customerCpf: string;
  product: string;
  amount: number;
  netAmount: number;
  installments: number;
  status: VendaStatus;
  partnerCommission: number;
  vendorCommission: number;
  date: string;
  createdAt: string;
  notes?: string;
}

export interface TabelaComissao {
  id: string;
  bancoId: string;
  bancoName: string;
  product: string;
  tableName: string;
  valueRange: string;
  commissionPercent: number;
  maxInstallments: number;
  status: 'Ativa' | 'Inativa';
}

export type ChamadoType = 'Solicitar Login' | 'Reset de Senha' | 'Reapresentar Proposta' | 'Novo Chamado' | 'Outro';
export type ChamadoStatus = 'Aberto' | 'Em Andamento' | 'Fechado';

export interface Chamado {
  id: string;
  ticketNumber: string;
  type: ChamadoType;
  corretorId: string;
  corretorName: string;
  title: string;
  description: string;
  status: ChamadoStatus;
  resolution?: string;
  createdAt: string;
  priority: 'Baixa' | 'Média' | 'Alta';
}

export interface DigitacaoInterna {
  id: string;
  protocolNumber: string;
  customerName: string;
  customerCpf: string;
  bancoName: string;
  product: string;
  amount: number;
  status: 'Pendente' | 'Processando' | 'Concluído' | 'Erro';
  corretorName: string;
  date: string;
  notes?: string;
}

export interface LoginBanco {
  id: string;
  bancoName: string;
  loginUser: string;
  status: 'Disponível' | 'Bloqueado' | 'Aguardando Reset';
  corretorId?: string;
  updatedAt: string;
}

export interface Anuncio {
  id: string;
  title: string;
  content: string;
  category: 'MURAL' | 'VENDEDOR';
  date: string;
  active: boolean;
  author: string;
  tag?: string;
}
