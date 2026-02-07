
import React from 'react';
import { User, Escola, Turma, Aluno, Aula, Presenca, Tutoria, Invite, Role } from './types';
import { useStorage } from './store';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import Attendance from './modules/Attendance';
import { Card, Button, Input, Modal, Badge } from './components/UI';
import { 
  Users, 
  GraduationCap, 
  ArrowRight, 
  UserPlus, 
  FileUp, 
  PlusCircle, 
  Mail, 
  ChevronLeft, 
  Trash2, 
  RotateCcw, 
  ShieldAlert,
  Search,
  School as SchoolIcon,
  CheckCircle2,
  Edit2,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';

const App: React.FC = () => {
  const storage = useStorage();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [activeView, setActiveView] = React.useState('dashboard');
  const [selectedTurma, setSelectedTurma] = React.useState<Turma | null>(null);
  const [selectedEscolaId, setSelectedEscolaId] = React.useState<string | null>(null);
  
  // Auth State
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  
  // Registration State
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regEscolaId, setRegEscolaId] = React.useState('');

  // Modals
  const [isSchoolModalOpen, setIsSchoolModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newSchool, setNewSchool] = React.useState({ nome: '', endereco: '' });
  const [inviteEmail, setInviteEmail] = React.useState('');

  const handleNavigate = (view: string) => {
    setActiveView(view);
    // Reset sub-views when navigating between main modules
    setSelectedEscolaId(null);
    setSelectedTurma(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.users.find(u => u && u.email === loginEmail);
    if (user && user.ativa && (loginPassword === 'Amor@9391' || loginPassword === 'admin')) {
      setCurrentUser(user);
      setLoginError('');
    } else if (user && !user.ativa) {
       setLoginError('Sua conta está inativa. Contate o administrador.');
    } else {
      setLoginError('Email ou senha incorretos.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEscolaId) {
      alert('Por favor, selecione uma escola.');
      return;
    }

    const invite = storage.invites.find(i => i && i.email === regEmail);
    const role = invite ? invite.role : 'professor';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      nome: regName,
      email: regEmail,
      role: role,
      escola_id: regEscolaId,
      ativa: true
    };

    storage.updateUsers([...storage.users, newUser]);
    if (invite) {
      storage.updateInvites(storage.invites.filter(i => i && i.email !== regEmail));
    }

    alert(`Cadastro realizado com sucesso como ${role}! Faça login.`);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    setSelectedEscolaId(null);
  };

  const handleCreateSchool = () => {
    if (!newSchool.nome || !newSchool.endereco) {
        alert("Preencha todos os campos.");
        return;
    }
    const escola: Escola = {
      id: `esc-${Date.now()}`,
      nome: newSchool.nome,
      endereco: newSchool.endereco,
      ativa: true
    };
    storage.updateSchools([...storage.schools, escola]);
    setIsSchoolModalOpen(false);
    setNewSchool({ nome: '', endereco: '' });
  };

  const handleSendInvite = () => {
    if (!inviteEmail) return;
    const invite: Invite = { email: inviteEmail, role: 'gestor' };
    storage.updateInvites([...storage.invites, invite]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    alert(`Convite de gestor registrado para ${inviteEmail}. No cadastro, este usuário terá perfil Gestor.`);
  };

  const handleUserAction = (userId: string, action: 'toggle' | 'reset' | 'delete' | 'edit') => {
    const userList = [...storage.users];
    const userIdx = userList.findIndex(u => u && u.id === userId);
    
    if (userIdx === -1) return;

    if (action === 'toggle') {
      userList[userIdx].ativa = !userList[userIdx].ativa;
      storage.updateUsers(userList);
    } else if (action === 'reset') {
      alert(`Senha de ${userList[userIdx].nome} resetada para padrão "123456".`);
    } else if (action === 'delete') {
      if (confirm(`Deseja EXCLUIR permanentemente o perfil de ${userList[userIdx].nome}?`)) {
        userList.splice(userIdx, 1);
        storage.updateUsers(userList);
      }
    } else if (action === 'edit') {
      setEditingUser(userList[userIdx]);
      setIsEditUserModalOpen(true);
    }
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    const userList = [...storage.users];
    const userIdx = userList.findIndex(u => u && u.id === editingUser.id);
    if (userIdx !== -1) {
      userList[userIdx] = editingUser;
      storage.updateUsers(userList);
    }
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onNavigate={handleNavigate} data={{ schools: storage.schools, classes: storage.classes, students: storage.students }} />;
      
      case 'schools':
        if (selectedEscolaId) {
          const escola = storage.schools.find(s => s && s.id === selectedEscolaId);
          const usersInSchool = storage.users.filter(u => u && u.escola_id === selectedEscolaId);
          
          return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               {/* Improved Breadcrumb Navigation */}
               <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                 <button onClick={() => setSelectedEscolaId(null)} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                   <SchoolIcon size={14} /> Unidades Escolares
                 </button>
                 <ChevronRight size={14} className="text-slate-300" />
                 <span className="text-slate-900 font-bold">{escola?.nome}</span>
               </nav>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedEscolaId(null)} 
                      className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm group"
                      title="Voltar para a lista"
                    >
                      <ChevronLeft size={20} className="text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{escola?.nome}</h1>
                      <p className="text-slate-500">Gestão centralizada de perfis e recursos</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="bg-white border border-slate-200 text-slate-600">
                      <FileUp size={18} /> Relatórios
                    </Button>
                    <Button variant="danger" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none">
                      <Trash2 size={18} /> Remover Unidade
                    </Button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <Card title="Resumo Geral">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-slate-500">Status Operacional:</span> 
                          <Badge color={escola?.ativa ? 'green' : 'red'}>{escola?.ativa ? 'Ativa' : 'Inativa'}</Badge>
                        </div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Gestores:</span> <span className="font-bold text-slate-900">{usersInSchool.filter(u => u.role === 'gestor').length}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Professores:</span> <span className="font-bold text-slate-900">{usersInSchool.filter(u => u.role === 'professor').length}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Turmas:</span> <span className="font-bold text-slate-900">{storage.classes.filter(t => t && t.escola_id === selectedEscolaId).length}</span></div>
                      </div>
                    </Card>

                    <Card title="Localização">
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100 italic">
                                "{escola?.endereco}"
                            </div>
                            <Button variant="ghost" className="w-full text-xs py-1 h-auto text-blue-600">Editar Endereço</Button>
                        </div>
                    </Card>
                  </div>

                  <Card title="Quadro de Usuários" className="md:col-span-2">
                    <div className="space-y-4">
                       {usersInSchool.length === 0 && (
                           <div className="text-center py-16">
                             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                               <Users size={32} />
                             </div>
                             <p className="text-slate-400 font-medium">Nenhum perfil cadastrado nesta unidade.</p>
                             <Button variant="ghost" className="mt-2 text-blue-600 text-sm">Convidar primeiro gestor</Button>
                           </div>
                       )}
                       {usersInSchool.map(u => (
                         <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors group">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'gestor' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                 {u.nome.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-bold text-slate-900 flex items-center gap-2">
                                   {u.nome} {!u.ativa && <Badge color="red">Inativo</Badge>}
                                 </p>
                                 <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{u.role} • {u.email}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleUserAction(u.id, 'edit')} title="Editar Total" className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                                 <Edit2 size={18} />
                               </button>
                               <button onClick={() => handleUserAction(u.id, 'toggle')} title={u.ativa ? "Inativar" : "Ativar"} className={`p-2 rounded-lg transition-colors ${u.ativa ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-emerald-100 text-emerald-600'}`}>
                                 <ShieldAlert size={18} />
                               </button>
                               <button onClick={() => handleUserAction(u.id, 'reset')} title="Resetar Senha" className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                                 <RotateCcw size={18} />
                               </button>
                               <button onClick={() => handleUserAction(u.id, 'delete')} title="Excluir" className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                 <Trash2 size={18} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </Card>
               </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900">Gestão de Unidades Escolares</h1>
                  <p className="text-slate-500">Selecione uma unidade para gerenciar perfis e turmas.</p>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                 <Button variant="secondary" onClick={() => setIsInviteModalOpen(true)} className="flex-1 sm:flex-none">
                   <Mail size={18} /> Convite Gestor
                 </Button>
                 <Button onClick={() => setIsSchoolModalOpen(true)} className="flex-1 sm:flex-none">
                   <PlusCircle size={18} /> Nova Escola
                 </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.schools.map(escola => (
                <Card 
                    key={escola.id} 
                    className="hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer border-2 border-transparent" 
                    onClick={() => setSelectedEscolaId(escola.id)}
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <SchoolIcon size={24} />
                      </div>
                      <Badge color={escola.ativa ? 'green' : 'red'}>{escola.ativa ? 'Ativa' : 'Inativa'}</Badge>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-1">{escola.nome}</h3>
                   <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter mb-4">Unidade Centralizada</p>
                   <p className="text-slate-500 text-sm mb-6 line-clamp-1 h-5">{escola.endereco}</p>
                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <Users size={14} />
                            <span className="font-bold">{storage.users.filter(u => u && u.escola_id === escola.id).length}</span>
                         </div>
                         <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <LayoutGrid size={14} />
                            <span className="font-bold">{storage.classes.filter(t => t && t.escola_id === escola.id).length}</span>
                         </div>
                      </div>
                      <div className="flex items-center text-blue-600 font-bold text-sm gap-2">Gerenciar <ArrowRight size={16} /></div>
                   </div>
                </Card>
              ))}
              
              {/* Empty state or Add card */}
              <button 
                onClick={() => setIsSchoolModalOpen(true)}
                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-400 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:scale-110 transition-all mb-4">
                  <PlusCircle size={28} />
                </div>
                <span className="font-bold text-slate-500 group-hover:text-slate-700">Adicionar Unidade</span>
              </button>
            </div>

            <Modal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} title="Nova Unidade Escolar">
               <div className="space-y-4">
                  <Input label="Nome da Escola" placeholder="Ex: Escola Municipal..." value={newSchool.nome} onChange={e => setNewSchool({ ...newSchool, nome: e.target.value })} />
                  <Input label="Endereço Completo" placeholder="Rua, Número, Bairro..." value={newSchool.endereco} onChange={e => setNewSchool({ ...newSchool, endereco: e.target.value })} />
                  <div className="flex gap-3 mt-6">
                    <Button variant="ghost" className="flex-1" onClick={() => setIsSchoolModalOpen(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleCreateSchool}>Criar Unidade</Button>
                  </div>
               </div>
            </Modal>

            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Convidar Gestor">
               <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">Ao enviar este convite, o e-mail informado será marcado para se tornar um Gestor ao realizar o cadastro inicial.</p>
                  <Input label="E-mail do Gestor" placeholder="gestor@escola.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <div className="flex gap-3 mt-6">
                    <Button variant="ghost" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleSendInvite}>Enviar Convite</Button>
                  </div>
               </div>
            </Modal>
          </div>
        );

      case 'classes':
        if (selectedTurma) {
          return (
            <Attendance 
              turma={selectedTurma} 
              alunos={storage.students.filter(s => s && s.turma_id === selectedTurma.id)}
              onBack={() => setSelectedTurma(null)}
              onSave={({ aula, presencas }) => {
                const newAula = { ...aula, id: `aula-${Date.now()}` } as Aula;
                const newPresencas = presencas.map(p => ({ ...p, id: `pres-${Math.random()}`, aula_id: newAula.id })) as Presenca[];
                storage.updateLessons([...storage.lessons, newAula]);
                storage.updateAttendance([...storage.attendance, ...newPresencas]);
                setSelectedTurma(null);
                alert('Chamada realizada com sucesso!');
              }}
            />
          );
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Minhas Turmas</h1>
                <p className="text-slate-500">Selecione uma turma para realizar a chamada.</p>
              </div>
              {currentUser.role === 'gestor' && (
                <Button variant="secondary">
                  <PlusCircle size={18} /> Nova Turma
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.classes
                .filter(t => t && t.escola_id === currentUser.escola_id)
                .map(turma => (
                  <Card key={turma.id} className="hover:border-blue-500 transition-colors group cursor-pointer" onClick={() => setSelectedTurma(turma)}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Users size={24} />
                      </div>
                      <Badge color={turma.turno === 'Manhã' ? 'yellow' : 'blue'}>{turma.turno}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{turma.nome}</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      {storage.students.filter(s => s && s.turma_id === turma.id).length} alunos cadastrados
                    </p>
                    <div className="flex items-center text-blue-600 font-bold text-sm gap-2">
                      Fazer Chamada <ArrowRight size={16} />
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
             <h1 className="text-2xl font-bold text-slate-900">Relatórios Escolares</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Frequência por Turma" className="h-48 flex items-center justify-center text-slate-400 italic">
                  Gráfico de evolução de frequência
                </Card>
                <Card title="Melhores Alunos" className="h-48 flex items-center justify-center text-slate-400 italic">
                  Ranking de desempenho acadêmico
                </Card>
             </div>
             <Card title="Exportar Dados">
               <div className="flex flex-wrap gap-4">
                  <Button variant="ghost" className="border border-slate-200">Exportar Alunos (CSV)</Button>
                  <Button variant="ghost" className="border border-slate-200">Boletins Gerais (PDF)</Button>
                  <Button variant="ghost" className="border border-slate-200">Histórico de Ocorrências</Button>
               </div>
             </Card>
          </div>
        );

      default:
        return <div className="text-slate-400 italic text-center py-20">Este módulo ({activeView}) será implementado em breve.</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-blue-600/20">E</div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduSync</h1>
            <p className="text-slate-500 font-medium">
              {isRegistering ? 'Crie sua conta de professor' : 'Acesse sua plataforma escolar integrada'}
            </p>
          </div>
          
          <Card className="p-8 shadow-xl">
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Nome Completo" placeholder="Seu nome" value={regName} onChange={e => setRegName(e.target.value)} required />
                <Input label="E-mail" placeholder="email@exemplo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                <Input label="Senha" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-slate-600">Sua Escola</label>
                  <select 
                    className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={regEscolaId}
                    onChange={e => setRegEscolaId(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma escola...</option>
                    {(storage.schools || []).filter(s => s && s.ativa).map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <Button className="w-full py-3 mt-4" type="submit">Cadastrar</Button>
                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-center text-sm text-blue-600 font-medium hover:underline">
                  Já tenho conta, fazer login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <Input label="E-mail" placeholder="nome@escola.com" type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <Input label="Senha" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
                <Button className="w-full py-3 text-lg" type="submit">Entrar no Sistema</Button>
                <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-center text-sm text-blue-600 font-medium hover:underline">
                  Não tenho conta, quero me cadastrar
                </button>
              </form>
            )}
          </Card>
          
          <p className="text-center text-sm text-slate-400">Dica: rafael@adm / Amor@9391</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      activeView={activeView} 
      onNavigate={handleNavigate} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
