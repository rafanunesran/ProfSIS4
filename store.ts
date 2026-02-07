
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  FirestoreError,
  query,
  limit
} from "firebase/firestore";
import { User, Escola, Turma, Aluno, Aula, Presenca, Tutoria, Invite } from './types';

const SESSION_KEY = 'user_session';
const SESSION_TIMEOUT = 48 * 60 * 60 * 1000;

export const useStorage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<Escola[]>([]);
  const [classes, setClasses] = useState<Turma[]>([]);
  const [students, setStudents] = useState<Aluno[]>([]);
  const [lessons, setLessons] = useState<Aula[]>([]);
  const [attendance, setAttendance] = useState<Presenca[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (err: FirestoreError) => {
      console.error("Firestore Error:", err);
      if (err.code === 'permission-denied') {
        setError("Erro de permissão: O Firestore está ativo mas as regras de segurança estão bloqueando o acesso. Configure o banco para 'Modo de Teste'.");
      } else if (err.message.includes('Service firestore is not available')) {
        setError("Erro de carregamento do Firebase. Verifique sua conexão e recarregue a página.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    };

    // Subscriptions com proteção contra documentos nulos
    const unsubUsers = onSnapshot(collection(db, "users"), (s) => {
      setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }) as User));
      setLoading(false);
    }, handleError);

    const unsubSchools = onSnapshot(collection(db, "schools"), (s) => 
      setSchools(s.docs.map(d => ({ id: d.id, ...d.data() }) as Escola)), handleError);
    
    const unsubClasses = onSnapshot(collection(db, "classes"), (s) => 
      setClasses(s.docs.map(d => ({ id: d.id, ...d.data() }) as Turma)), handleError);
    
    const unsubStudents = onSnapshot(collection(db, "students"), (s) => 
      setStudents(s.docs.map(d => ({ id: d.id, ...d.data() }) as Aluno)), handleError);
    
    const unsubLessons = onSnapshot(collection(db, "lessons"), (s) => 
      setLessons(s.docs.map(d => ({ id: d.id, ...d.data() }) as Aula)), handleError);
    
    const unsubAttendance = onSnapshot(collection(db, "attendance"), (s) => 
      setAttendance(s.docs.map(d => ({ id: d.id, ...d.data() }) as Presenca)), handleError);
    
    const unsubInvites = onSnapshot(collection(db, "invites"), (s) => 
      setInvites(s.docs.map(d => d.data() as Invite)), handleError);

    return () => {
      unsubUsers(); unsubSchools(); unsubClasses(); unsubStudents(); unsubLessons(); unsubAttendance(); unsubInvites();
    };
  }, []);

  const saveToFirestore = async (coll: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, coll, id), data, { merge: true });
    } catch (e) {
      console.error("Erro ao salvar no Firestore:", e);
      throw e;
    }
  };

  const deleteFromFirestore = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (e) {
      console.error("Erro ao excluir no Firestore:", e);
      throw e;
    }
  };

  return {
    users, schools, classes, students, lessons, attendance, invites, loading, error,
    
    getSession: (): User | null => {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      try {
        const { user, timestamp } = JSON.parse(sessionData);
        if (Date.now() - timestamp > SESSION_TIMEOUT) {
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        return user;
      } catch { return null; }
    },

    setSession: (user: User | null) => {
      if (!user) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, JSON.stringify({ user, timestamp: Date.now() }));
    },

    updateSessionTimestamp: () => {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          parsed.timestamp = Date.now();
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        } catch {}
      }
    },

    upsertUser: (u: User) => saveToFirestore("users", u.id, u),
    deleteUser: (id: string) => deleteFromFirestore("users", id),
    upsertSchool: (s: Escola) => saveToFirestore("schools", s.id, s),
    upsertClass: (t: Turma) => saveToFirestore("classes", t.id, t),
    upsertStudent: (a: Aluno) => saveToFirestore("students", a.id, a),
    upsertLesson: (l: Aula) => saveToFirestore("lessons", l.id, l),
    upsertAttendance: (p: Presenca) => saveToFirestore("attendance", p.id, p),
    addInvite: (i: Invite) => setDoc(doc(db, "invites", i.email), i),
    removeInvite: (email: string) => deleteDoc(doc(db, "invites", email))
  };
};
