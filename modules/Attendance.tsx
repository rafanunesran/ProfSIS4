
import React from 'react';
import { Turma, Aluno, Aula, Presenca } from '../types';
import { Card, Button, Badge, Input } from '../components/UI';
import { Check, X, Save, Clock, ChevronLeft } from 'lucide-react';

interface AttendanceProps {
  turma: Turma;
  alunos: Aluno[];
  onBack: () => void;
  onSave: (data: { aula: Partial<Aula>, presencas: Partial<Presenca>[] }) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ turma, alunos, onBack, onSave }) => {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = React.useState('');
  const [attendances, setAttendances] = React.useState<Record<string, 'presente' | 'falta'>>(
    Object.fromEntries(alunos.map(a => [a.id, 'presente']))
  );

  const toggleStatus = (id: string) => {
    setAttendances(prev => ({
      ...prev,
      [id]: prev[id] === 'presente' ? 'falta' : 'presente'
    }));
  };

  const handleSave = () => {
    onSave({
      aula: { turma_id: turma.id, data: date, conteudo: content, chamada_realizada: true },
      presencas: Object.entries(attendances).map(([aluno_id, status]) => ({ aluno_id, status }))
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chamada Eletrônica</h1>
          <p className="text-slate-500">{turma.nome} • {turma.turno}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Lista de Alunos">
            <div className="space-y-2">
              {alunos.sort((a,b) => a.numero_chamada - b.numero_chamada).map(aluno => (
                <div 
                  key={aluno.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    attendances[aluno.id] === 'falta' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {aluno.numero_chamada}
                    </span>
                    <span className="font-semibold text-slate-800">{aluno.nome_completo}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAttendances(prev => ({ ...prev, [aluno.id]: 'presente' }))}
                      className={`p-2 rounded-lg transition-colors ${attendances[aluno.id] === 'presente' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => setAttendances(prev => ({ ...prev, [aluno.id]: 'falta' }))}
                      className={`p-2 rounded-lg transition-colors ${attendances[aluno.id] === 'falta' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Informações da Aula">
            <div className="space-y-4">
              <Input 
                type="date" 
                label="Data da Aula" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600">Conteúdo Ministrado</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-32"
                  placeholder="Descreva o que foi trabalhado hoje..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Resumo">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total de alunos:</span>
                <span className="font-bold text-slate-900">{alunos.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Presentes:</span>
                <span className="font-bold text-emerald-600">{Object.values(attendances).filter(v => v === 'presente').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Faltas:</span>
                <span className="font-bold text-red-500">{Object.values(attendances).filter(v => v === 'falta').length}</span>
              </div>
              <Button className="w-full mt-4" onClick={handleSave}>
                <Save size={18} /> Confirmar Chamada
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
