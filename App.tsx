
import React from 'react';
import { User, Escola, Turma, Aluno, Aula, Presenca, Invite, Role } from './types';
import { useStorage } from './store';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import Attendance from './modules/Attendance';
import { Card, Button, Input, Modal, Badge } from './components/UI';
import { 
  Users, ArrowRight, PlusCircle, Mail, ChevronLeft, Trash2, 
  RotateCcw, ShieldAlert, School as SchoolIcon, Edit2, ChevronRight, 
  FileUp, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';

const App: React.FC = () => {
  const storage = useStorage();
  const [currentUser, setCurrentUser] = React.useState<User | null>(storage.getSession());
  const [activeView, setActiveView] = React.useState('dashboard');
  const [selectedTurma, setSelectedTurma] = React.useState<Turma | null>(null);
  const [selectedEscolaId, setSelectedEscolaId] = React.useState<string | null>(null);
  
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regEscolaId, setRegEscolaId] = React.useState('');

  const [isSchoolModalOpen, setIsSchoolModalOpen] = React.useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newSchool, setNewSchool] = React.useState({ nome: '', endereco: '' });

  React.useEffect(() => {
    if (currentUser) storage.updateSessionTimestamp();
  }, [activeView, selectedTurma, selectedEscolaId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.users.find(u => u.email === loginEmail);
    if (user && user.ativa && (loginPassword === 'Amor@9391' || loginPassword === 'admin')) {
      setCurrentUser(user);
      storage.setSession(user);
      setLoginError('');
    } else if (user && !user.ativa) setLoginError('Perfil inativo.');
    else setLoginError('E-mail ou senha inválidos.');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEscolaId) return alert('Selecione uma escola.');
    
    try {
      const invite = storage.invites.find(i => i.email === regEmail);
      const role = invite ? invite.role : 'professor';
      const newUser: User = {
        id: `usr-${Date.now()}`,
        nome: regName, 
        email: regEmail, 
        role: role as Role, 
        escola_id: regEscolaId, 
        ativa: true
      };
      await storage.upsertUser(newUser);
      if (invite) await storage.removeInvite(regEmail);
      alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
      setIsRegistering(false);
      setLoginEmail(regEmail);
    } catch (err) {
      alert("Erro ao cadastrar. Verifique sua conexão.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.setSession(null);
    setActiveView('dashboard');
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedEscolaId(null);
    setSelectedTurma(null);
  };

  const handleCreateSchool = async () => {
    if (!newSchool.nome) return;
    try {
      const s: Escola = { id: `esc-${Date.now()}`, nome: newSchool.nome, endereco: newSchool.endereco, ativa: true };
      await storage.upsertSchool(s);
      setIsSchoolModalOpen(false);
      setNewSchool({ nome: '', endereco: '' });
    } catch (e) {
      alert("Erro ao criar escola no Firestore.");
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    const user = storage.users.find(u => u.id === userId);
    if (!user) return;
    try {
      if (action === 'toggle') await storage.upsertUser({...user, ativa: !user.ativa});
      if (action === 'delete') if(confirm('Deseja realmente excluir este usuário?')) await storage.deleteUser(userId);
      if (action === 'edit') { setEditingUser(user); setIsEditUserModalOpen(true); }
    } catch (err) {
      alert("Erro ao processar ação.");
    }
  };

  if (storage.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <Card className="max-w-md border-red-200 bg-white">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Erro de Conexão</h2>
              <p className="text-slate-600 text-sm mt-2">{storage.error}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left text-slate-600 space-y-2 w-full">
              <p className="font-bold text-slate-800">Possíveis Soluções:</p>
              <p>• Verifique se o Cloud Firestore está ativo no projeto <b>profsis4</b>.</p>
              <p>• Certifique-se de que as regras de segurança estão em <b>Modo de Teste</b>.</p>
              <p>• Verifique se sua conexão com a internet está estável.</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
              <RefreshCw size={18} /> Tentar Novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (storage.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">Carregando dados escolares...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onNavigate={handleNavigate} data={{ schools: storage.schools, classes: storage.classes, students: storage.students }} />;
      case 'schools':
        if (selectedEscolaId) {
          const escola = storage.schools.find(s => s.id === selectedEscolaId);
          const usersInSchool = storage.users.filter(u => u.escola_id === selectedEscolaId);
          return (
            <div className="space-y-6 animate-fade-in">
               <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                 <button onClick={() => setSelectedEscolaId(null)} className="hover:text-blue-600 flex items-center gap-1"><SchoolIcon size={14} /> Escolas</button>
                 <ChevronRight size={14} /> <span className="text-slate-900 font-bold">{escola?.nome}</span>
               </nav>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedEscolaId(null)} className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-colors"><ChevronLeft size={20} /></button>
                    <h1 className="text-2xl font-bold text-slate-900">{escola?.nome}</h1>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card title="Status Unidade" className="md:col-span-1">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Estado atual:</span>
                        <Badge color={escola?.ativa ? 'green' : 'red'}>{escola?.ativa ? 'Ativa' : 'Inativa'}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{escola?.endereco}</p>
                    </div>
                  </Card>
                  <Card title="Usuários Vinculados" className="md:col-span-2">
                    <div className="space-y-1">
                      {usersInSchool.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">Nenhum usuário cadastrado nesta unidade.</p>
                      ) : (
                        usersInSchool.map(u => (
                          <div key={u.id} className="flex justify-between p-3 border-b last:border-0 items-center hover:bg-slate-50 rounded-lg transition-colors">
                            <div>
                              <p className="font-bold text-slate-800">{u.nome}</p>
                              <p className="text-xs text-slate-500">{u.email} • <span className="capitalize">{u.role.replace('_', ' ')}</span></p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleUserAction(u.id, 'edit')} title="Editar" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                              <button onClick={() => handleUserAction(u.id, 'toggle')} title={u.ativa ? 'Inativar' : 'Ativar'} className={`p-1.5 rounded-lg transition-all ${u.ativa ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-amber-600 bg-amber-50'}`}><ShieldAlert size={16}/></button>
                              <button onClick={() => handleUserAction(u.id, 'delete')} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
               </div>
            </div>
          );
        }
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-slate-900">Unidades Escolares</h1>
               <Button onClick={() => setIsSchoolModalOpen(true)}><PlusCircle size={18} /> Nova Escola</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.schools.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white border-2 border-dashed rounded-2xl border-slate-200">
                  <SchoolIcon size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma escola cadastrada.</p>
                  <Button variant="ghost" onClick={() => setIsSchoolModalOpen(true)} className="mt-4">Começar Agora</Button>
                </div>
              ) : (
                storage.schools.map(escola => (
                  <Card key={escola.id} className="hover:border-blue-500 cursor-pointer group transition-all" onClick={() => setSelectedEscolaId(escola.id)}>
                     <div className="flex justify-between mb-4">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <SchoolIcon size={24}/>
                       </div>
                       <Badge color={escola.ativa ? 'green' : 'red'}>{escola.ativa ? 'Ativa' : 'Inativa'}</Badge>
                     </div>
                     <h3 className="text-xl font-bold text-slate-800">{escola.nome}</h3>
                     <p className="text-sm text-slate-500 mt-1 line-clamp-1">{escola.endereco || 'Endereço não informado'}</p>
                  </Card>
                ))
              )}
            </div>

            <Modal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} title="Cadastrar Nova Escola">
               <div className="space-y-4">
                 <Input label="Nome da Unidade" placeholder="Ex: Escola Municipal..." value={newSchool.nome} onChange={e => setNewSchool({...newSchool, nome: e.target.value})} />
                 <Input label="Endereço" placeholder="Rua, Número, Bairro..." value={newSchool.endereco} onChange={e => setNewSchool({...newSchool, endereco: e.target.value})} />
                 <div className="flex gap-3 mt-6">
                   <Button variant="ghost" className="flex-1" onClick={() => setIsSchoolModalOpen(false)}>Cancelar</Button>
                   <Button className="flex-1" onClick={handleCreateSchool}>Cadastrar Escola</Button>
                 </div>
               </div>
            </Modal>
          </div>
        );
      case 'classes':
        if (selectedTurma) {
          return <Attendance 
            turma={selectedTurma} 
            alunos={storage.students.filter(s => s.turma_id === selectedTurma.id)} 
            onBack={() => setSelectedTurma(null)} 
            onSave={async (d) => {
              try {
                const aulaId = `aula-${Date.now()}`;
                await storage.upsertLesson({ ...d.aula, id: aulaId } as Aula);
                for (const p of d.presencas) {
                  await storage.upsertAttendance({ ...p, id: `p-${Math.random().toString(36).substr(2, 9)}`, aula_id: aulaId } as Presenca);
                }
                setSelectedTurma(null); 
                alert('Chamada realizada e sincronizada online!');
              } catch (err) {
                alert("Erro ao salvar chamada. Tente novamente.");
              }
            }} 
          />;
        }
        return (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900">Minhas Turmas</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.classes.filter(t => t.escola_id === currentUser.escola_id).length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white border rounded-2xl border-slate-200">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma turma vinculada a você nesta escola.</p>
                </div>
              ) : (
                storage.classes.filter(t => t.escola_id === currentUser.escola_id).map(turma => (
                  <Card key={turma.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTurma(turma)}>
                    <div className="flex justify-between mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24}/>
                      </div>
                      <Badge>{turma.turno}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{turma.nome}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Acessar chamada</span>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/20">E</div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">EduSync</h1>
            <p className="text-slate-500 mt-2 font-medium">Sistema Integrado de Gestão Escolar</p>
          </div>
          <Card className="p-8 shadow-2xl border-0 ring-1 ring-slate-200">
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Nome Completo" placeholder="Seu nome" value={regName} onChange={e => setRegName(e.target.value)} required />
                <Input label="E-mail Institucional" type="email" placeholder="nome@escola.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                <Input label="Senha de Acesso" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-slate-600">Sua Unidade Escolar</label>
                  <select 
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                    value={regEscolaId} 
                    onChange={e => setRegEscolaId(e.target.value)} 
                    required
                  >
                    <option value="">Selecione a escola...</option>
                    {storage.schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <Button className="w-full h-12 text-lg mt-4" type="submit">Concluir Cadastro</Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Já possui conta?</span></div>
                </div>
                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-center text-sm text-blue-600 font-bold hover:underline transition-all">Acessar com E-mail e Senha</button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <Input label="E-mail" placeholder="usuario@escola.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <Input label="Senha" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                {loginError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">
                    <AlertTriangle size={16} />
                    {loginError}
                  </div>
                )}
                <Button className="w-full h-12 text-lg" type="submit">Entrar no EduSync</Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Novo por aqui?</span></div>
                </div>
                <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-center text-sm text-blue-600 font-bold hover:underline transition-all">Criar minha conta institucional</button>
              </form>
            )}
          </Card>
          <p className="text-center text-xs text-slate-400">© 2025 EduSync Gestão • Todos os direitos reservados</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} activeView={activeView} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
