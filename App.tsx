
import React from 'react';
import { User, Escola, Turma, Aluno, Aula, Presenca, Tutoria, Invite, Role } from './types';
import { useStorage } from './store';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import Attendance from './modules/Attendance';
import { Card, Button, Input, Modal, Badge } from './components/UI';
import { 
  Users, 
  ArrowRight, 
  PlusCircle, 
  Mail, 
  ChevronLeft, 
  Trash2, 
  RotateCcw, 
  ShieldAlert,
  School as SchoolIcon,
  Edit2,
  ChevronRight,
  LayoutGrid,
  FileUp
} from 'lucide-react';

const App: React.FC = () => {
  const storage = useStorage();
  const [currentUser, setCurrentUser] = React.useState<User | null>(storage.getSession());
  const [activeView, setActiveView] = React.useState('dashboard');
  const [selectedTurma, setSelectedTurma] = React.useState<Turma | null>(null);
  const [selectedEscolaId, setSelectedEscolaId] = React.useState<string | null>(null);
  
  // Estados de Autenticação
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  
  // Estados de Cadastro
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regEscolaId, setRegEscolaId] = React.useState('');

  // Modais e Estados de Edição
  const [isSchoolModalOpen, setIsSchoolModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newSchool, setNewSchool] = React.useState({ nome: '', endereco: '' });
  const [inviteEmail, setInviteEmail] = React.useState('');

  // Atualiza o timestamp da sessão a cada interação importante
  React.useEffect(() => {
    if (currentUser) {
      storage.updateSessionTimestamp();
    }
  }, [activeView, selectedTurma, selectedEscolaId]);

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedEscolaId(null);
    setSelectedTurma(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.users.find(u => u && u.email === loginEmail);
    // Senha universal mockada para testes: admin ou Amor@9391
    if (user && user.ativa && (loginPassword === 'Amor@9391' || loginPassword === 'admin')) {
      setCurrentUser(user);
      storage.setSession(user);
      setLoginError('');
    } else if (user && !user.ativa) {
       setLoginError('Esta conta está inativada. Contate o suporte.');
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEscolaId) return alert('Selecione uma escola para vincular seu perfil.');
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
    if (invite) storage.updateInvites(storage.invites.filter(i => i && i.email !== regEmail));
    alert(`Cadastro realizado com sucesso! Agora você pode entrar.`);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.setSession(null);
    setActiveView('dashboard');
    setSelectedEscolaId(null);
  };

  const handleCreateSchool = () => {
    if (!newSchool.nome || !newSchool.endereco) return alert("Preencha todos os campos.");
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
    alert(`Convite de gestor registrado para ${inviteEmail}.`);
  };

  const handleUserAction = (userId: string, action: 'toggle' | 'reset' | 'delete' | 'edit') => {
    const userList = [...storage.users];
    const userIdx = userList.findIndex(u => u && u.id === userId);
    if (userIdx === -1) return;

    if (action === 'toggle') {
      userList[userIdx].ativa = !userList[userIdx].ativa;
      storage.updateUsers(userList);
    } else if (action === 'reset') {
      alert(`A senha de ${userList[userIdx].nome} foi resetada para o padrão "admin".`);
    } else if (action === 'delete') {
      if (confirm(`Tem certeza que deseja remover permanentemente o perfil de ${userList[userIdx].nome}?`)) {
        userList.splice(userIdx, 1);
        storage.updateUsers(userList);
      }
    } else if (action === 'edit') {
      setEditingUser({ ...userList[userIdx] });
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
      // Se for o próprio usuário logado, atualiza a sessão
      if (currentUser?.id === editingUser.id) {
          setCurrentUser(editingUser);
          storage.setSession(editingUser);
      }
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
            <div className="space-y-6 animate-fade-in">
               <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                 <button onClick={() => setSelectedEscolaId(null)} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                   <SchoolIcon size={14} /> Unidades Escolares
                 </button>
                 <ChevronRight size={14} className="text-slate-300" />
                 <span className="text-slate-900 font-bold">{escola?.nome}</span>
               </nav>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedEscolaId(null)} className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm group">
                      <ChevronLeft size={20} className="text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{escola?.nome}</h1>
                      <p className="text-slate-500">Gestão operacional desta unidade</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="bg-white border border-slate-200">
                      <FileUp size={18} /> Exportar Dados
                    </Button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <Card title="Estatísticas">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center"><span className="text-slate-500">Status:</span> <Badge color={escola?.ativa ? 'green' : 'red'}>{escola?.ativa ? 'Ativa' : 'Inativa'}</Badge></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Gestores:</span> <span className="font-bold">{usersInSchool.filter(u => u.role === 'gestor').length}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Professores:</span> <span className="font-bold">{usersInSchool.filter(u => u.role === 'professor').length}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Turmas:</span> <span className="font-bold">{storage.classes.filter(t => t && t.escola_id === selectedEscolaId).length}</span></div>
                      </div>
                    </Card>
                    <Card title="Localização">
                        <p className="text-sm text-slate-500 italic">"{escola?.endereco}"</p>
                    </Card>
                  </div>

                  <Card title="Pessoas e Perfis Cadastrados" className="md:col-span-2">
                    <div className="space-y-4">
                       {usersInSchool.length === 0 && <div className="text-center py-10 text-slate-400">Nenhum perfil vinculado a esta escola.</div>}
                       {usersInSchool.map(u => (
                         <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors group">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'gestor' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                 {u.nome.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-bold text-slate-900 flex items-center gap-2">{u.nome} {!u.ativa && <Badge color="red">Inativo</Badge>}</p>
                                 <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{u.role} • {u.email}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleUserAction(u.id, 'edit')} title="Editar Perfil" className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg"><Edit2 size={18} /></button>
                               <button onClick={() => handleUserAction(u.id, 'toggle')} title={u.ativa ? "Desativar" : "Ativar"} className={`p-2 rounded-lg ${u.ativa ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-emerald-100 text-emerald-600'}`}><ShieldAlert size={18} /></button>
                               <button onClick={() => handleUserAction(u.id, 'reset')} title="Resetar Senha" className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg"><RotateCcw size={18} /></button>
                               <button onClick={() => handleUserAction(u.id, 'delete')} title="Excluir Permanentemente" className="p-2 hover:bg-red-100 text-red-600 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </Card>
               </div>

               <Modal isOpen={isEditUserModalOpen} onClose={() => setIsEditUserModalOpen(false)} title="Editar Informações de Usuário">
                  {editingUser && (
                    <div className="space-y-4">
                       <Input label="Nome Completo" value={editingUser.nome} onChange={e => setEditingUser({...editingUser, nome: e.target.value})} />
                       <Input label="E-mail de Acesso" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                       <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-slate-600">Nível de Acesso (Role)</label>
                          <select className="px-4 py-2 rounded-lg border border-slate-300 bg-white" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}>
                             <option value="professor">Professor</option>
                             <option value="gestor">Gestor</option>
                          </select>
                       </div>
                       <div className="flex gap-3 mt-6">
                         <Button variant="ghost" className="flex-1" onClick={() => setIsEditUserModalOpen(false)}>Cancelar</Button>
                         <Button className="flex-1" onClick={handleSaveUserEdit}>Salvar Alterações</Button>
                       </div>
                    </div>
                  )}
               </Modal>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900">Unidades Escolares</h1>
                  <p className="text-slate-500">Gerenciamento global de instituições e acessos.</p>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                 <Button variant="secondary" onClick={() => setIsInviteModalOpen(true)} className="flex-1 sm:flex-none"><Mail size={18} /> Enviar Convite</Button>
                 <Button onClick={() => setIsSchoolModalOpen(true)} className="flex-1 sm:flex-none"><PlusCircle size={18} /> Cadastrar Escola</Button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.schools.map(escola => (
                <Card key={escola.id} className="hover:border-blue-500 hover:shadow-md cursor-pointer group transition-all" onClick={() => setSelectedEscolaId(escola.id)}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><SchoolIcon size={24} /></div>
                      <Badge color={escola.ativa ? 'green' : 'red'}>{escola.ativa ? 'Ativa' : 'Inativa'}</Badge>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-1">{escola.nome}</h3>
                   <p className="text-slate-500 text-sm mb-6 line-clamp-1">{escola.endereco}</p>
                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 text-slate-500 text-sm"><Users size={14} /> <span className="font-bold">{storage.users.filter(u => u && u.escola_id === escola.id).length}</span></div>
                         <div className="flex items-center gap-1 text-slate-500 text-sm"><LayoutGrid size={14} /> <span className="font-bold">{storage.classes.filter(t => t && t.escola_id === escola.id).length}</span></div>
                      </div>
                      <div className="flex items-center text-blue-600 font-bold text-sm gap-2">Gerenciar <ArrowRight size={16} /></div>
                   </div>
                </Card>
              ))}
            </div>
            <Modal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} title="Nova Unidade Escolar">
               <div className="space-y-4">
                  <Input label="Nome da Unidade" placeholder="Ex: Escola Municipal..." value={newSchool.nome} onChange={e => setNewSchool({ ...newSchool, nome: e.target.value })} />
                  <Input label="Endereço Completo" placeholder="Rua, Número, Bairro..." value={newSchool.endereco} onChange={e => setNewSchool({ ...newSchool, endereco: e.target.value })} />
                  <div className="flex gap-3 mt-6"><Button variant="ghost" className="flex-1" onClick={() => setIsSchoolModalOpen(false)}>Cancelar</Button><Button className="flex-1" onClick={handleCreateSchool}>Salvar Escola</Button></div>
               </div>
            </Modal>
            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Convidar Novo Gestor">
               <div className="space-y-4">
                  <Input label="E-mail do Gestor" placeholder="exemplo@escola.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <p className="text-xs text-slate-400 italic">Este e-mail será marcado no sistema para receber privilégios de gestor ao se cadastrar.</p>
                  <div className="flex gap-3 mt-6"><Button variant="ghost" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>Cancelar</Button><Button className="flex-1" onClick={handleSendInvite}>Confirmar Convite</Button></div>
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
                alert('Chamada eletrônica realizada e salva com sucesso!');
              }}
            />
          );
        }
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div><h1 className="text-2xl font-bold text-slate-900">Turmas da Unidade</h1><p className="text-slate-500">Selecione uma turma para registrar presença.</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storage.classes.filter(t => t && t.escola_id === currentUser.escola_id).map(turma => (
                <Card key={turma.id} className="hover:border-blue-500 transition-all group cursor-pointer" onClick={() => setSelectedTurma(turma)}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Users size={24} /></div>
                    <Badge color={turma.turno === 'Manhã' ? 'yellow' : 'blue'}>{turma.turno}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{turma.nome}</h3>
                  <p className="text-slate-500 text-sm mb-6">{storage.students.filter(s => s && s.turma_id === turma.id).length} alunos vinculados</p>
                  <div className="flex items-center text-blue-600 font-bold text-sm gap-2">Abrir Chamada <ArrowRight size={16} /></div>
                </Card>
              ))}
            </div>
          </div>
        );

      default: return <div className="text-slate-400 italic text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">Este módulo ({activeView}) está sendo preparado.</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-blue-500/30">E</div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduSync</h1>
            <p className="text-slate-500 font-medium">{isRegistering ? 'Crie seu perfil profissional' : 'Gestão escolar inteligente e simplificada'}</p>
          </div>
          <Card className="p-8 shadow-2xl border-0">
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Nome Completo" placeholder="Ex: Prof. João Silva" value={regName} onChange={e => setRegName(e.target.value)} required />
                <Input label="E-mail" placeholder="email@instituicao.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                <Input label="Senha" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-slate-600">Unidade Escolar</label>
                  <select className="px-4 py-2 rounded-lg border border-slate-300 bg-white" value={regEscolaId} onChange={e => setRegEscolaId(e.target.value)} required>
                    <option value="">Selecione sua escola...</option>
                    {(storage.schools || []).filter(s => s && s.ativa).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <Button className="w-full py-3 mt-4" type="submit">Finalizar Cadastro</Button>
                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-center text-sm text-blue-600 font-bold hover:underline">Já tenho acesso, fazer login</button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <Input label="E-mail institucional" placeholder="nome@escola.com" type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <Input label="Sua senha" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                {loginError && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded border border-red-100">{loginError}</p>}
                <Button className="w-full py-3 text-lg font-bold shadow-lg shadow-blue-500/20" type="submit">Entrar no Sistema</Button>
                <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-center text-sm text-blue-600 font-bold hover:underline">Solicitar novo cadastro</button>
              </form>
            )}
          </Card>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">EduSync v1.0 • Desenvolvido para máxima produtividade</p>
            <p className="text-[10px] text-slate-300 mt-1">Acesso Demonstração: rafael@adm / Amor@9391</p>
          </div>
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
