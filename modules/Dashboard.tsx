
import React from 'react';
import { User, Escola, Turma, Aluno } from '../types';
import { Card, Badge } from '../components/UI';
import { 
  Users, 
  School, 
  GraduationCap, 
  TrendingUp,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  data: {
    schools: Escola[];
    classes: Turma[];
    students: Aluno[];
  };
  onNavigate: (view: string) => void;
}

const StatsCard = ({ title, value, icon: Icon, color, trend, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all group border-l-4 border-l-transparent hover:border-l-blue-500 p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
          <TrendingUp size={16} /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ user, data, onNavigate }) => {
  // Safety guard: if user is missing, don't crash the calculation
  if (!user) return null;

  const schoolStudents = (data.students || []).filter(s => {
    if (!s) return false;
    const turma = (data.classes || []).find(t => t && t.id === s.turma_id);
    return turma?.escola_id === user.escola_id;
  });

  const chartData = [
    { name: 'Presentes', value: 85, fill: '#3b82f6' },
    { name: 'Faltas', value: 12, fill: '#f43f5e' },
    { name: 'Atrasos', value: 3, fill: '#f59e0b' },
  ];

  const attendanceData = [
    { day: 'Seg', rate: 92 },
    { day: 'Ter', rate: 88 },
    { day: 'Qua', rate: 95 },
    { day: 'Qui', rate: 91 },
    { day: 'Sex', rate: 84 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo, {user.nome}! 👋</h1>
          <p className="text-slate-500">Aqui está o resumo do que está acontecendo hoje.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <CalendarDays size={20} className="text-blue-600" />
          <span className="font-semibold text-slate-700">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'super_admin' ? (
          <>
            <StatsCard onClick={() => onNavigate('schools')} title="Total de Escolas" value={data.schools.length} icon={School} color="bg-blue-600" trend="+2 este mês" />
            <StatsCard onClick={() => onNavigate('schools')} title="Gestores Ativos" value={12} icon={Users} color="bg-purple-600" />
            <StatsCard onClick={() => onNavigate('reports')} title="Total de Alunos" value={data.students.length} icon={GraduationCap} color="bg-emerald-600" trend="+15%" />
            <StatsCard onClick={() => onNavigate('dashboard')} title="Sistema Saúde" value="Excelente" icon={TrendingUp} color="bg-amber-600" />
          </>
        ) : (
          <>
            <StatsCard onClick={() => onNavigate('classes')} title="Turmas Ativas" value={data.classes.filter(t => t && t.escola_id === user.escola_id).length} icon={Users} color="bg-blue-600" />
            <StatsCard onClick={() => onNavigate('classes')} title="Meus Alunos" value={schoolStudents.length} icon={GraduationCap} color="bg-emerald-600" />
            <StatsCard onClick={() => onNavigate('reports')} title="Frequência Média" value="92%" icon={TrendingUp} color="bg-purple-600" />
            <StatsCard onClick={() => onNavigate('occurrences')} title="Pendências" value="3" icon={AlertCircle} color="bg-red-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Frequência Semanal (%)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuição de Presenças">
          <div className="h-[300px] w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.fill}} />
                  <span className="text-xs font-medium text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
