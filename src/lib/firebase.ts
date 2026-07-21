import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Banco, Venda, TabelaComissao, Chamado, DigitacaoInterna, LoginBanco, UserProfile, Anuncio } from '../types';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const storage = getStorage(app);

// Seed Data for initial application load
export const INITIAL_BANCOS: Omit<Banco, 'id'>[] = [
  { name: 'Crefisa', code: '069', loginUrl: 'https://app1.gerencialcredito.com.br/CREFISA/#xd_co_f=ZGNhOWU3NDktOTU5Ni00YjBkLThlMDctMTQyYTY2NTlhN2U5~', status: 'ATIVO', position: 1, certificationRequired: true, category: 'Consignado & Crédito', defaultCommission: 12.5 },
  { name: 'Unno', code: '901', loginUrl: 'https://login.unnotech.com.br/', status: 'ATIVO', position: 2, certificationRequired: false, category: 'Consignado & FGTS', defaultCommission: 11.0 },
  { name: 'Eccor', code: '902', loginUrl: 'https://app.eccor.io/login', status: 'ATIVO', position: 3, certificationRequired: false, category: 'Plataforma Multibancos', defaultCommission: 10.5 },
  { name: 'Prata', code: '903', loginUrl: 'https://admin.bancoprata.com.br/', status: 'ATIVO', position: 4, certificationRequired: true, category: 'Consignado & Cartão', defaultCommission: 13.0 },
  { name: 'Novo Saque', code: '904', loginUrl: 'https://sistema.novosaque.com.br/admin/users', status: 'ATIVO', position: 5, certificationRequired: false, category: 'Antecipação FGTS', defaultCommission: 12.0 },
  { name: 'Presença Bank', code: '905', loginUrl: 'https://portal.presencabank.com.br/sign-in', status: 'ATIVO', position: 6, certificationRequired: true, category: 'Consignado & Financiamento', defaultCommission: 11.5 },
  { name: 'DSV', code: '906', loginUrl: 'https://app.dsvdigi.com.br/', status: 'ATIVO', position: 7, certificationRequired: false, category: 'Digitação & Esteira', defaultCommission: 10.0 },
  { name: 'Lotus', code: '907', loginUrl: 'https://app.lotusmais.com.br/fgts/new', status: 'ATIVO', position: 8, certificationRequired: false, category: 'FGTS Saque Aniversário', defaultCommission: 13.5 },
  { name: 'Vctex', code: '908', loginUrl: 'https://www.appvctex.com.br/login', status: 'ATIVO', position: 9, certificationRequired: false, category: 'Esteira Digital', defaultCommission: 10.5 },
  { name: 'Icred', code: '909', loginUrl: 'https://corban.icred.digital/login', status: 'ATIVO', position: 10, certificationRequired: true, category: 'Corban Digital & Crédito', defaultCommission: 12.0 },
  { name: 'DREXPIX', code: '910', loginUrl: 'https://app.drexpix.tech/login', status: 'ATIVO', position: 11, certificationRequired: false, category: 'Antecipação Pix & FGTS', defaultCommission: 14.0 },
  { name: 'PH Tech', code: '911', loginUrl: 'https://phtech.uy3.com.br/login', status: 'ATIVO', position: 12, certificationRequired: false, category: 'Tecnologia & Crédito', defaultCommission: 11.0 },
  { name: 'V8', code: '912', loginUrl: 'https://app.v8sistema.com/', status: 'ATIVO', position: 13, certificationRequired: false, category: 'Sistema Consignado', defaultCommission: 10.0 },
  { name: 'Top mais Top', code: '913', loginUrl: 'https://app.topmaistop.com.br/', status: 'ATIVO', position: 14, certificationRequired: false, category: 'Consignado & Promotora', defaultCommission: 12.5 },
  { name: 'Fintech do Corban', code: '914', loginUrl: 'https://fintechdocorban.nossafintech.com.br/session/login', status: 'ATIVO', position: 15, certificationRequired: false, category: 'Plataforma Fintech', defaultCommission: 11.0 },
  { name: 'Hub', code: '915', loginUrl: 'https://fgts.hubcredito.com.br/login', status: 'ATIVO', position: 16, certificationRequired: false, category: 'Antecipação FGTS', defaultCommission: 13.0 },
  { name: 'Hand+', code: '916', loginUrl: 'https://app.handbank.com.br/', status: 'ATIVO', position: 17, certificationRequired: false, category: 'HandBank Consignado', defaultCommission: 10.5 },
  { name: 'Finanto', code: '917', loginUrl: 'https://finanto.joinbank.com.br/sign-in?redirectURL=%2Fmain', status: 'ATIVO', position: 18, certificationRequired: false, category: 'JoinBank & Finanto', defaultCommission: 12.0 },
];

export const INITIAL_VENDEDORES: Omit<UserProfile, 'id'>[] = [
  {
    uid: 'corretor-carlos-1',
    name: 'Carlos Eduardo Silva',
    email: 'carlos.silva@grupoalexandrita.com.br',
    password: '123456',
    cpf: '234.567.890-11',
    phone: '(11) 97654-3210',
    role: 'corretor',
    status: 'ATIVO',
    createdAt: '2026-07-01T10:00:00Z',
    referralCode: 'CARLOS2026',
    payoutInfo: { pixKey: '234.567.890-11', bankName: 'Itaú Consignado' }
  },
  {
    uid: 'corretor-mariana-2',
    name: 'Mariana Oliveira Santos',
    email: 'mariana.santos@grupoalexandrita.com.br',
    password: '123456',
    cpf: '345.678.901-22',
    phone: '(11) 98888-7777',
    role: 'corretor',
    status: 'ATIVO',
    createdAt: '2026-07-05T14:30:00Z',
    referralCode: 'MARI2026',
    payoutInfo: { pixKey: 'mariana.santos@grupoalexandrita.com.br', bankName: 'Banco Pan' }
  }
];

export const INITIAL_VENDAS: Omit<Venda, 'id'>[] = [];

export const INITIAL_TABELAS: Omit<TabelaComissao, 'id'>[] = [
  { bancoId: 'pan', bancoName: 'Banco Pan', product: 'INSS Novo', tableName: 'Pan Ouro 84x - INSS', valueRange: 'R$ 1.000,00 a R$ 50.000,00', commissionPercent: 12.0, maxInstallments: 84, status: 'Ativa' },
  { bancoId: 'pan', bancoName: 'Banco Pan', product: 'Refinanciamento', tableName: 'Pan Refin Flex', valueRange: 'R$ 2.000,00 a R$ 30.000,00', commissionPercent: 10.5, maxInstallments: 84, status: 'Ativa' },
  { bancoId: 'itau', bancoName: 'Itaú Consignado', product: 'INSS Novo', tableName: 'Itaú Premium 84x', valueRange: 'R$ 1.500,00 a R$ 60.000,00', commissionPercent: 12.5, maxInstallments: 84, status: 'Ativa' },
  { bancoId: 'facta', bancoName: 'Facta Financeira', product: 'BPC / LOAS', tableName: 'Facta Especial BPC 84x', valueRange: 'R$ 1.000,00 a R$ 18.000,00', commissionPercent: 13.0, maxInstallments: 84, status: 'Ativa' },
  { bancoId: 'c6bank', bancoName: 'C6 Bank', product: 'Antecipação FGTS', tableName: 'C6 Express FGTS', valueRange: 'R$ 300,00 a R$ 20.000,00', commissionPercent: 11.0, maxInstallments: 10, status: 'Ativa' },
  { bancoId: 'daycoval', bancoName: 'Banco Daycoval', product: 'SIAPE / Governos', tableName: 'Daycoval Federal 96x', valueRange: 'R$ 3.000,00 a R$ 100.000,00', commissionPercent: 14.0, maxInstallments: 96, status: 'Ativa' }
];

export const INITIAL_CHAMADOS: Omit<Chamado, 'id'>[] = [
  {
    ticketNumber: 'TKT-1042',
    type: 'Solicitar Login',
    corretorId: 'demo-corretor-uid-1',
    corretorName: 'Carlos Eduardo Silva',
    title: 'Solicitação de Acesso - Sistema Facta',
    description: 'Solicito a liberação do meu usuário de digitação no sistema da Facta Financeira.',
    status: 'Aberto',
    createdAt: '2026-07-21T09:30:00Z',
    priority: 'Alta'
  },
  {
    ticketNumber: 'TKT-1039',
    type: 'Reset de Senha',
    corretorId: 'demo-corretor-uid-2',
    corretorName: 'Mariana Oliveira Santos',
    title: 'Reset de Senha Banco Pan',
    description: 'Minha senha do portal do Banco Pan expirou. Solícito o envio de nova senha temporária.',
    status: 'Fechado',
    resolution: 'Senha resetada com sucesso. Enviada via WhatsApp do corretor.',
    createdAt: '2026-07-20T14:15:00Z',
    priority: 'Média'
  }
];

export const INITIAL_ANUNCIOS: Omit<Anuncio, 'id'>[] = [
  {
    title: '🚀 Campanha Super Bônus Banco Pan - Julho 2026',
    content: 'Todas as esteiras de INSS Novo do Banco Pan operando com comissão turbinada em +1.5% durante toda esta semana! Aproveite e digite suas propostas.',
    category: 'MURAL',
    date: '21/07/2026',
    active: true,
    author: 'Diretoria Grupo Alexandrita',
    tag: 'DESTAQUE'
  },
  {
    title: '⚠️ Manutenção Programada Banco BMG',
    content: 'O sistema do Banco BMG estará instável entre 18:00 e 20:00 para atualização de tabelas de margem consignável.',
    category: 'VENDEDOR',
    date: '20/07/2026',
    active: true,
    author: 'Suporte Operacional'
  }
];

export const INITIAL_LOGINS: Omit<LoginBanco, 'id'>[] = [
  { bancoName: 'Banco Pan', loginUser: 'ALEXANDRITA_PAN_01', status: 'Disponível', updatedAt: '2026-07-21' },
  { bancoName: 'Itaú Consignado', loginUser: 'CORRETOR_ITAU_MAIN', status: 'Disponível', updatedAt: '2026-07-20' },
  { bancoName: 'Facta Financeira', loginUser: 'FACTA_DIGITACAO_03', status: 'Bloqueado', updatedAt: '2026-07-19' }
];

// Helper to check and seed firestore collections
export async function seedFirestoreIfEmpty() {
  try {
    const bancosSnap = await getDocs(collection(db, 'bancos'));
    const docs = bancosSnap.docs;
    const hasCrefisa = docs.some(d => (d.data().name || '').toLowerCase() === 'crefisa');

    if (bancosSnap.empty || !hasCrefisa) {
      console.log('Updating / seeding latest bank list in Firestore...');
      for (const d of docs) {
        await deleteDoc(doc(db, 'bancos', d.id));
      }
      for (const b of INITIAL_BANCOS) {
        await addDoc(collection(db, 'bancos'), b);
      }
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      for (const v of INITIAL_VENDEDORES) {
        await addDoc(collection(db, 'users'), v);
      }
    }

    const vendasSnap = await getDocs(collection(db, 'vendas'));
    if (vendasSnap.empty) {
      for (const sale of INITIAL_VENDAS) {
        await addDoc(collection(db, 'vendas'), sale);
      }
    }

    const tabelasSnap = await getDocs(collection(db, 'tabelas'));
    if (tabelasSnap.empty) {
      for (const t of INITIAL_TABELAS) {
        await addDoc(collection(db, 'tabelas'), t);
      }
    }

    const chamadosSnap = await getDocs(collection(db, 'chamados'));
    if (chamadosSnap.empty) {
      for (const c of INITIAL_CHAMADOS) {
        await addDoc(collection(db, 'chamados'), c);
      }
    }

    const anunciosSnap = await getDocs(collection(db, 'anuncios'));
    if (anunciosSnap.empty) {
      for (const a of INITIAL_ANUNCIOS) {
        await addDoc(collection(db, 'anuncios'), a);
      }
    }

    const loginsSnap = await getDocs(collection(db, 'logins'));
    if (loginsSnap.empty) {
      for (const l of INITIAL_LOGINS) {
        await addDoc(collection(db, 'logins'), l);
      }
    }
  } catch (err) {
    console.warn('Firestore seed check notice:', err);
  }
}
