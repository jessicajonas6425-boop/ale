import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  doc, 
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  db, 
  seedFirestoreIfEmpty,
  INITIAL_BANCOS,
  INITIAL_VENDEDORES,
  INITIAL_VENDAS,
  INITIAL_TABELAS,
  INITIAL_CHAMADOS,
  INITIAL_ANUNCIOS,
  INITIAL_LOGINS
} from './lib/firebase';
import { 
  UserProfile, 
  Banco, 
  Venda, 
  TabelaComissao, 
  Chamado, 
  DigitacaoInterna, 
  LoginBanco, 
  Anuncio,
  VendaStatus,
  ChamadoStatus
} from './types';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/views/DashboardView';
import { BancosView } from './components/views/BancosView';
import { VendasView } from './components/views/VendasView';
import { TabelasView } from './components/views/TabelasView';
import { ChamadosView } from './components/views/ChamadosView';
import { DigitacaoView } from './components/views/DigitacaoView';
import { LoginsView } from './components/views/LoginsView';
import { VendedoresView } from './components/views/VendedoresView';
import { MeuPerfilView } from './components/views/MeuPerfilView';

export default function App() {
  // Current Logged User (Starts null so user must log in)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Firestore Collections State
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [tabelas, setTabelas] = useState<TabelaComissao[]>([]);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [digitacoes, setDigitacoes] = useState<DigitacaoInterna[]>([]);
  const [logins, setLogins] = useState<LoginBanco[]>([]);
  const [vendedores, setVendedores] = useState<UserProfile[]>([]);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

  // Seed & Realtime Subscriptions
  useEffect(() => {
    seedFirestoreIfEmpty();

    // 1. Bancos Realtime with Deduplication
    const unsubBancos = onSnapshot(collection(db, 'bancos'), (snapshot) => {
      let rawItems: Banco[] = [];
      if (snapshot.empty) {
        rawItems = INITIAL_BANCOS.map((b, idx) => ({ id: `banco-${idx}`, ...b }));
      } else {
        rawItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banco));
      }
      // Filter out duplicate banks by normalized name or code
      const uniqueBancos: Banco[] = [];
      const seen = new Set<string>();
      for (const item of rawItems) {
        const key = (item.name || '').trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueBancos.push(item);
        }
      }
      setBancos(uniqueBancos);
    }, (err) => {
      console.warn('Fallback Bancos state:', err);
      setBancos(INITIAL_BANCOS.map((b, idx) => ({ id: `banco-${idx}`, ...b })));
    });

    // 2. Vendas Realtime
    const unsubVendas = onSnapshot(collection(db, 'vendas'), (snapshot) => {
      if (snapshot.empty) {
        setVendas([]);
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Venda));
        setVendas(items);
      }
    }, (err) => {
      console.warn('Fallback Vendas state:', err);
      setVendas([]);
    });

    // 3. Tabelas Realtime
    const unsubTabelas = onSnapshot(collection(db, 'tabelas'), (snapshot) => {
      if (snapshot.empty) {
        setTabelas(INITIAL_TABELAS.map((t, idx) => ({ id: `tab-${idx}`, ...t })));
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TabelaComissao));
        setTabelas(items);
      }
    }, (err) => {
      setTabelas(INITIAL_TABELAS.map((t, idx) => ({ id: `tab-${idx}`, ...t })));
    });

    // 4. Chamados Realtime
    const unsubChamados = onSnapshot(collection(db, 'chamados'), (snapshot) => {
      if (snapshot.empty) {
        setChamados(INITIAL_CHAMADOS.map((c, idx) => ({ id: `ch-${idx}`, ...c })));
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Chamado));
        setChamados(items);
      }
    }, (err) => {
      setChamados(INITIAL_CHAMADOS.map((c, idx) => ({ id: `ch-${idx}`, ...c })));
    });

    // 5. Digitacoes Realtime
    const unsubDigitacoes = onSnapshot(collection(db, 'digitacao'), (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DigitacaoInterna));
      setDigitacoes(items);
    }, (err) => {
      setDigitacoes([]);
    });

    // 6. Logins Realtime
    const unsubLogins = onSnapshot(collection(db, 'logins'), (snapshot) => {
      if (snapshot.empty) {
        setLogins(INITIAL_LOGINS.map((l, idx) => ({ id: `log-${idx}`, ...l })));
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LoginBanco));
        setLogins(items);
      }
    }, (err) => {
      setLogins(INITIAL_LOGINS.map((l, idx) => ({ id: `log-${idx}`, ...l })));
    });

    // 7. Users / Vendedores Realtime
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) {
        setVendedores([]);
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
        setVendedores(items);
      }
    }, (err) => {
      setVendedores([]);
    });

    // 8. Anuncios Realtime
    const unsubAnuncios = onSnapshot(collection(db, 'anuncios'), (snapshot) => {
      if (snapshot.empty) {
        setAnuncios(INITIAL_ANUNCIOS.map((a, idx) => ({ id: `anuncios-${idx}`, ...a })));
      } else {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Anuncio));
        setAnuncios(items);
      }
    }, (err) => {
      setAnuncios(INITIAL_ANUNCIOS.map((a, idx) => ({ id: `anuncios-${idx}`, ...a })));
    });

    return () => {
      unsubBancos();
      unsubVendas();
      unsubTabelas();
      unsubChamados();
      unsubDigitacoes();
      unsubLogins();
      unsubUsers();
      unsubAnuncios();
    };
  }, []);

  // Handler: Toggle Demo Role (Admin <-> Corretor)
  const handleToggleRole = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setCurrentUser({
        id: 'demo-corretor-id',
        uid: 'demo-corretor-uid-1',
        name: 'Carlos Eduardo Silva',
        email: 'carlos.silva@grupoalexandrita.com.br',
        cpf: '234.567.890-11',
        phone: '(11) 97654-3210',
        role: 'corretor',
        status: 'ATIVO',
        createdAt: new Date().toISOString(),
        referralCode: 'CARLOS2025',
        payoutInfo: { pixKey: '234.567.890-11', bankName: 'Itaú Consignado' }
      });
    } else {
      setCurrentUser({
        id: 'demo-admin-id',
        uid: 'demo-admin-uid',
        name: 'Ana Carolina Alexandrita',
        email: 'admin@grupoalexandrita.com.br',
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        role: 'admin',
        status: 'ATIVO',
        createdAt: new Date().toISOString(),
        referralCode: 'ALEX-ADMIN',
        payoutInfo: { pixKey: 'admin@grupoalexandrita.com.br', bankName: 'Banco Pan' }
      });
    }
  };
  // Handler CRUD Functions
  const handleAddBanco = async (bancoData: Omit<Banco, 'id'>) => {
    try {
      await addDoc(collection(db, 'bancos'), bancoData);
    } catch (e) {
      setBancos(prev => [{ id: `banco-${Date.now()}`, ...bancoData }, ...prev]);
    }
  };

  const handleUpdateBancoStatus = async (bancoId: string, status: Banco['status']) => {
    try {
      const ref = doc(db, 'bancos', bancoId);
      await updateDoc(ref, { status });
    } catch (e) {
      setBancos(prev => prev.map(b => b.id === bancoId ? { ...b, status } : b));
    }
  };

  const handleDeleteBanco = async (bancoId: string) => {
    try {
      await deleteDoc(doc(db, 'bancos', bancoId));
    } catch (e) {
      console.warn('Local fallback delete bank:', e);
    }
    setBancos(prev => prev.filter(b => b.id !== bancoId));
  };

  const handleRestoreDefaultBancos = async () => {
    try {
      const snap = await getDocs(collection(db, 'bancos'));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'bancos', d.id));
      }
      for (const b of INITIAL_BANCOS) {
        await addDoc(collection(db, 'bancos'), b);
      }
    } catch (e) {
      console.warn('Local fallback restore bancos:', e);
    }
  };

  const handleAddVenda = async (vendaData: Omit<Venda, 'id'>) => {
    try {
      await addDoc(collection(db, 'vendas'), vendaData);
    } catch (e) {
      setVendas(prev => [{ id: `venda-${Date.now()}`, ...vendaData }, ...prev]);
    }
  };

  const handleUpdateVendaStatus = async (vendaId: string, status: VendaStatus) => {
    try {
      const ref = doc(db, 'vendas', vendaId);
      await updateDoc(ref, { status });
    } catch (e) {
      setVendas(prev => prev.map(v => v.id === vendaId ? { ...v, status } : v));
    }
  };

  const handleAddTabela = async (tabelaData: Omit<TabelaComissao, 'id'>) => {
    try {
      await addDoc(collection(db, 'tabelas'), tabelaData);
    } catch (e) {
      setTabelas(prev => [{ id: `tab-${Date.now()}`, ...tabelaData }, ...prev]);
    }
  };

  const handleAddChamado = async (chamadoData: Omit<Chamado, 'id'>) => {
    try {
      await addDoc(collection(db, 'chamados'), chamadoData);
    } catch (e) {
      setChamados(prev => [{ id: `ch-${Date.now()}`, ...chamadoData }, ...prev]);
    }
  };

  const handleUpdateChamado = async (id: string, status: ChamadoStatus, resolution?: string) => {
    try {
      const ref = doc(db, 'chamados', id);
      await updateDoc(ref, { status, resolution: resolution || '' });
    } catch (e) {
      setChamados(prev => prev.map(c => c.id === id ? { ...c, status, resolution } : c));
    }
  };

  const handleAddDigitacao = async (digData: Omit<DigitacaoInterna, 'id'>) => {
    try {
      await addDoc(collection(db, 'digitacao'), digData);
    } catch (e) {
      setDigitacoes(prev => [{ id: `dig-${Date.now()}`, ...digData }, ...prev]);
    }
  };

  const handleAddLogin = async (loginData: Omit<LoginBanco, 'id'>) => {
    try {
      await addDoc(collection(db, 'logins'), loginData);
    } catch (e) {
      setLogins(prev => [{ id: `log-${Date.now()}`, ...loginData }, ...prev]);
    }
  };

  const handleAddVendedor = async (vendedorData: Omit<UserProfile, 'id'>) => {
    try {
      await addDoc(collection(db, 'users'), vendedorData);
    } catch (e) {
      setVendedores(prev => [{ id: `usr-${Date.now()}`, ...vendedorData }, ...prev]);
    }
  };

  const handleUpdateVendedor = async (vendedorId: string, updatedData: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', vendedorId);
      await updateDoc(userRef, updatedData);
    } catch (e) {
      console.warn('Local fallback update vendedor:', e);
    }
    setVendedores(prev => prev.map(v => (v.id === vendedorId || v.uid === vendedorId) ? { ...v, ...updatedData } : v));
  };

  const handleDeleteVendedor = async (vendedorId: string) => {
    try {
      await deleteDoc(doc(db, 'users', vendedorId));
    } catch (e) {
      console.warn('Local fallback delete vendedor:', e);
    }
    setVendedores(prev => prev.filter(v => v.id !== vendedorId && v.uid !== vendedorId));
  };

  const handleClearData = async () => {
    try {
      const salesSnap = await getDocs(collection(db, 'vendas'));
      for (const d of salesSnap.docs) {
        await deleteDoc(doc(db, 'vendas', d.id));
      }
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const d of usersSnap.docs) {
        await deleteDoc(doc(db, 'users', d.id));
      }
    } catch (e) {
      console.warn('Clear data exception:', e);
    }
    setVendas([]);
    setVendedores([]);
  };;

  const handleAddAnuncio = async (anuncioData: Omit<Anuncio, 'id'>) => {
    try {
      await addDoc(collection(db, 'anuncios'), anuncioData);
    } catch (e) {
      setAnuncios(prev => [{ id: `an-${Date.now()}`, ...anuncioData }, ...prev]);
    }
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);
    try {
      const ref = doc(db, 'users', currentUser.id || currentUser.uid);
      updateDoc(ref, updated);
    } catch (e) {
      console.log('Profile state updated locally');
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] font-sans text-gray-800 flex" id="app-root">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onToggleRole={handleToggleRole}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          setIsOpenMobile={setIsOpenMobile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNavigateProfile={() => setActiveTab('perfil')}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              vendas={vendas}
              anuncios={anuncios}
              bancos={bancos}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onAddAnuncio={handleAddAnuncio}
            />
          )}

          {activeTab === 'bancos' && (
            <BancosView
              bancos={bancos}
              currentUser={currentUser}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddBanco={handleAddBanco}
              onUpdateBancoStatus={handleUpdateBancoStatus}
              onDeleteBanco={handleDeleteBanco}
              onRestoreDefaultBancos={handleRestoreDefaultBancos}
            />
          )}

          {activeTab === 'vendas' && (
            <VendasView
              vendas={vendas}
              bancos={bancos}
              currentUser={currentUser}
              vendedores={vendedores}
              onAddVenda={handleAddVenda}
              onUpdateVendaStatus={handleUpdateVendaStatus}
            />
          )}

          {activeTab === 'tabelas' && (
            <TabelasView
              tabelas={tabelas}
              bancos={bancos}
              currentUser={currentUser}
              onAddTabela={handleAddTabela}
            />
          )}

          {activeTab === 'chamados' && (
            <ChamadosView
              chamados={chamados}
              currentUser={currentUser}
              onAddChamado={handleAddChamado}
              onUpdateChamado={handleUpdateChamado}
            />
          )}

          {activeTab === 'digitacao' && (
            <DigitacaoView
              digitacoes={digitacoes}
              bancos={bancos}
              currentUser={currentUser}
              onAddDigitacao={handleAddDigitacao}
            />
          )}

          {activeTab === 'logins' && (
            <LoginsView
              logins={logins}
              bancos={bancos}
              currentUser={currentUser}
              onAddLogin={handleAddLogin}
            />
          )}

          {activeTab === 'vendedores' && (
            <VendedoresView
              vendedores={vendedores}
              currentUser={currentUser}
              onAddVendedor={handleAddVendedor}
              onUpdateVendedor={handleUpdateVendedor}
              onDeleteVendedor={handleDeleteVendedor}
              onClearData={handleClearData}
            />
          )}

          {activeTab === 'perfil' && (
            <MeuPerfilView
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}
