
import { User, Escola, Turma, Aluno, Aula, Presenca, Tutoria, Invite } from './types';

// Initial Mock Data
const MOCK_SCHOOLS: Escola[] = [
  { id: 'esc-1', nome: 'Escola Municipal Central', endereco: 'Rua Principal, 123', ativa: true },
  { id: 'esc-2', nome: 'Colégio Estadual do Futuro', endereco: 'Av. Brasil, 456', ativa: true },
];

const MOCK_USERS: User[] = [
  { id: 'usr-1', email: 'rafael@adm', nome: 'Rafael Admin', role: 'super_admin', ativa: true },
  { id: 'usr-2', email: 'gestor@escola', nome: 'Carlos Gestor', role: 'gestor', escola_id: 'esc-1', ativa: true },
  { id: 'usr-3', email: 'prof@escola', nome: 'Maria Professora', role: 'professor', escola_id: 'esc-1', ativa: true },
];

const MOCK_TURMAS: Turma[] = [
  { id: 'tur-1', escola_id: 'esc-1', nome: '9º A', turno: 'Manhã' },
  { id: 'tur-2', escola_id: 'esc-1', nome: '1º Médio B', turno: 'Tarde' },
];

const MOCK_ALUNOS: Aluno[] = [
  { id: 'alu-1', turma_id: 'tur-1', nome_completo: 'Ana Silva', numero_chamada: 1, status: 'Ativo' },
  { id: 'alu-2', turma_id: 'tur-1', nome_completo: 'Bruno Souza', numero_chamada: 2, status: 'Ativo' },
  { id: 'alu-3', turma_id: 'tur-2', nome_completo: 'Carla Dias', numero_chamada: 1, status: 'Ativo' },
];

// Helper to manage storage
export const useStorage = () => {
  const get = <T,>(key: string, initial: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  };

  const set = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return {
    users: get<User[]>('users', MOCK_USERS),
    schools: get<Escola[]>('schools', MOCK_SCHOOLS),
    classes: get<Turma[]>('classes', MOCK_TURMAS),
    students: get<Aluno[]>('students', MOCK_ALUNOS),
    lessons: get<Aula[]>('lessons', []),
    attendance: get<Presenca[]>('attendance', []),
    tutoring: get<Tutoria[]>('tutoring', []),
    invites: get<Invite[]>('invites', []),
    
    updateUsers: (data: User[]) => set('users', data),
    updateSchools: (data: Escola[]) => set('schools', data),
    updateClasses: (data: Turma[]) => set('classes', data),
    updateStudents: (data: Aluno[]) => set('students', data),
    updateLessons: (data: Aula[]) => set('lessons', data),
    updateAttendance: (data: Presenca[]) => set('attendance', data),
    updateTutoring: (data: Tutoria[]) => set('tutoring', data),
    updateInvites: (data: Invite[]) => set('invites', data),
  };
};
