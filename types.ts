
export type Role = 'professor' | 'gestor' | 'super_admin';

export interface User {
  id: string;
  email: string;
  nome: string;
  role: Role;
  escola_id?: string;
  must_change_password?: boolean;
  ativa: boolean; // For inactivate functionality
}

export interface Escola {
  id: string;
  nome: string;
  endereco: string;
  ativa: boolean;
}

export interface Invite {
  email: string;
  role: Role;
}

export interface Turma {
  id: string;
  escola_id: string;
  nome: string;
  turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
}

export interface Aluno {
  id: string;
  turma_id: string;
  nome_completo: string;
  numero_chamada: number;
  status: 'Ativo' | 'Baixa/Transferência' | 'Transferido' | 'NCOM';
}

export interface Aula {
  id: string;
  turma_id: string;
  data: string;
  conteudo: string;
  chamada_realizada: boolean;
}

export interface Presenca {
  id: string;
  aula_id: string;
  aluno_id: string;
  status: 'presente' | 'falta';
}

export interface Tutoria {
  id: string;
  professor_id: string;
  aluno_id: string;
  data: string;
  hora: string;
  tema?: string;
}
