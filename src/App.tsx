import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  Clock, 
  Users, 
  MapPin, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// URL fixa do bot/painel principal do provedor
const API_URL = 'https://service.mundonetbandalarga.com.br/api';

interface Incident {
  id: number;
  title: string;
  classification: string;
  affected_regions: string;
  affected_clients: string;
  status: string;
  eta: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  duration_seconds?: number;
}

interface Maintenance {
  id: number;
  title: string;
  schedule_date: string;
  affected_regions: string;
  expected_impact: string;
  status: string;
  created_at: string;
}

interface StatusData {
  overallStatus: 'Operacional' | 'Instabilidade Parcial' | 'Incidente Ativo' | 'Manutenção Programada';
  activeIncidents: Incident[];
  activeMaintenances: Maintenance[];
  history: Incident[];
}

export default function App() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null);

  const fetchStatus = async (showRefresher = false) => {
    if (showRefresher) setIsRefreshing(true);
    try {
      const response = await axios.get(`${API_URL}/public/status`);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar o status da rede:', err);
      setError('Não foi possível atualizar o status da rede neste momento. Tentaremos novamente.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const parseUTCDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('Z') || (dateStr.includes('-') && dateStr.includes('T'))) {
      return new Date(dateStr);
    }
    const formatted = dateStr.replace(' ', 'T') + 'Z';
    return new Date(formatted);
  };

  const toggleIncidentDetails = (id: number) => {
    setExpandedIncident(expandedIncident === id ? null : id);
  };

  const getStatusConfig = (status: StatusData['overallStatus']) => {
    switch (status) {
      case 'Operacional':
        return {
          bg: 'bg-emerald-50 border-emerald-300',
          text: 'text-emerald-900',
          shadow: 'shadow-[0_4px_20px_rgba(16,185,129,0.08)]',
          icon: <CheckCircle2 className="w-16 h-16 text-emerald-600" />,
          title: 'Todos os Sistemas Operacionais',
          description: 'Não há registros de falhas ou instabilidades na nossa rede no momento. Aproveite sua conexão!'
        };
      case 'Instabilidade Parcial':
        return {
          bg: 'bg-amber-50 border-amber-300',
          text: 'text-amber-900',
          shadow: 'shadow-[0_4px_20px_rgba(245,158,11,0.08)]',
          icon: <AlertTriangle className="w-16 h-16 text-amber-600 animate-pulse" />,
          title: 'Instabilidade Parcial na Rede',
          description: 'Identificamos oscilações em algumas áreas específicas. Nossa equipe técnica já está atuando para normalização.'
        };
      case 'Incidente Ativo':
        return {
          bg: 'bg-rose-50 border-rose-300',
          text: 'text-rose-900',
          shadow: 'shadow-[0_4px_20px_rgba(244,63,94,0.08)]',
          icon: <XCircle className="w-16 h-16 text-rose-600 animate-bounce" />,
          title: 'Problema Identificado na Rede',
          description: 'Há um incidente afetando um grupo maior de clientes. Estamos dedicando todos os esforços na resolução.'
        };
      case 'Manutenção Programada':
        return {
          bg: 'bg-sky-50 border-sky-300',
          text: 'text-sky-900',
          shadow: 'shadow-[0_4px_20px_rgba(14,165,233,0.08)]',
          icon: <Wrench className="w-16 h-16 text-sky-600" />,
          title: 'Manutenção em Andamento',
          description: 'Realizando melhorias programadas na infraestrutura para garantir uma estabilidade ainda melhor para você.'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-300',
          text: 'text-slate-900',
          shadow: 'shadow-none',
          icon: <AlertCircle className="w-16 h-16 text-slate-600" />,
          title: 'Status Desconhecido',
          description: 'Carregando informações operacionais...'
        };
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutos`;
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-black border text-white shadow-sm";
    switch (status) {
      case 'Investigando':
        return `${base} bg-slate-600 border-slate-700`;
      case 'Equipe a caminho':
        return `${base} bg-amber-500 border-amber-600`;
      case 'Equipe atuando':
        return `${base} bg-blue-600 border-blue-750`;
      case 'Resolvido':
        return `${base} bg-emerald-600 border-emerald-700`;
      default:
        return `${base} bg-slate-600 border-slate-700`;
    }
  };

  const getClassificationBadge = (classification: string) => {
    const base = "px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider text-white shadow-sm";
    switch (classification) {
      case 'Regional':
        return `${base} bg-indigo-600 border border-indigo-700`;
      case 'Municipal':
        return `${base} bg-violet-600 border border-violet-700`;
      case 'Link Principal':
        return `${base} bg-amber-600 border border-amber-700`;
      case 'Incidente Geral':
        return `${base} bg-rose-600 border border-rose-700`;
      default:
        return `${base} bg-slate-600 border border-slate-700`;
    }
  };

  const getMaintenanceBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-black border text-white shadow-sm";
    switch (status) {
      case 'Agendado':
        return `${base} bg-indigo-600 border-indigo-700`;
      case 'Em Execução':
        return `${base} bg-sky-500 border-sky-600 animate-pulse`;
      case 'Concluído':
        return `${base} bg-emerald-600 border-emerald-700`;
      case 'Cancelado':
        return `${base} bg-rose-600 border-rose-700`;
      default:
        return `${base} bg-slate-600 border-slate-700`;
    }
  };

  const currentStatus = data ? getStatusConfig(data.overallStatus) : getStatusConfig('Operacional');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 selection:bg-cyan-500/20">
      {/* Background Decorative Blobs */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header - Centered & Big Logo */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-all py-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center gap-4">
          <img src="/logo.png" alt="MundoNet Telecom" className="h-16 md:h-20 object-contain max-w-full" />
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-xs font-black tracking-widest text-slate-500 uppercase">Status da Rede</h1>
            {isRefreshing && (
              <span className="text-xs text-cyan-600 animate-pulse flex items-center gap-1.5 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
              </span>
            )}
          </div>
          <button 
            onClick={() => fetchStatus(true)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold flex items-center gap-2 text-slate-700 active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar Agora
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 flex flex-col gap-8">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Resumo da Saúde */}
        <section className={`p-8 rounded-3xl border backdrop-blur-xl ${currentStatus.bg} ${currentStatus.shadow} transition-all duration-500 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden`}>
          <div className="shrink-0">{currentStatus.icon}</div>
          <div className="flex-1 flex flex-col gap-2 z-10">
            <h2 className="text-2xl font-black text-slate-900">{currentStatus.title}</h2>
            <p className="text-slate-700 text-sm leading-relaxed max-w-xl font-medium">{currentStatus.description}</p>
          </div>
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-white rounded-2xl p-2 border border-slate-200 z-10 shadow-sm flex items-center justify-center backdrop-blur-md">
            <img src="/mascot.png" alt="Mascote MundoNet" className="w-full h-full object-contain" />
          </div>
        </section>

        {/* 2. Incidentes Ativos */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Incidentes Ativos</h3>
            <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full font-bold text-slate-650 shadow-sm">
              {data?.activeIncidents.length || 0} ativo(s)
            </span>
          </div>

          {data && data.activeIncidents.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-500 text-sm font-semibold shadow-sm">
              Não há incidentes ativos reportados nas últimas horas.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.activeIncidents.map((incident) => {
                const isExpanded = expandedIncident === incident.id;
                return (
                  <div 
                    key={incident.id} 
                    className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:border-slate-350 transition-all shadow-sm"
                  >
                    <div 
                      onClick={() => toggleIncidentDetails(incident.id)}
                      className="p-5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={getClassificationBadge(incident.classification)}>
                            {incident.classification}
                          </span>
                          <span className={getStatusBadge(incident.status)}>
                            {incident.status}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 truncate">{incident.title}</h4>
                      </div>
                      <div className="text-slate-400 shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Regiões Afetadas</p>
                              <p className="text-sm font-semibold text-slate-800">{incident.affected_regions}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Users className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Clientes Impactados</p>
                              <p className="text-sm font-semibold text-slate-800">{incident.affected_clients}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Horário de Início</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {parseUTCDate(incident.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Wrench className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Previsão de Normalização</p>
                              <p className="text-sm font-semibold text-slate-800">{incident.eta || 'A analisar'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shadow-sm">
                          <span>Última atualização: {parseUTCDate(incident.updated_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Manutenções Programadas */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Manutenções Programadas</h3>
            <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full font-bold text-slate-655 shadow-sm">
              {data?.activeMaintenances.length || 0} agendada(s)
            </span>
          </div>

          {data && data.activeMaintenances.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-500 text-sm font-semibold shadow-sm">
              Não há manutenções programadas agendadas para os próximos dias.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.activeMaintenances.map((m) => (
                <div 
                  key={m.id} 
                  className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col gap-4 hover:border-slate-350 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                    <span className={getMaintenanceBadge(m.status)}>
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Data e Horário</p>
                        <p className="text-sm font-semibold text-slate-800">{m.schedule_date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Regiões Afetadas</p>
                        <p className="text-sm font-semibold text-slate-800">{m.affected_regions}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Impacto Esperado</p>
                        <p className="text-sm font-semibold text-slate-800">{m.expected_impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Histórico dos últimos 30 dias */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Histórico Recente (Últimos 30 dias)</h3>

          {data && data.history.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-500 text-sm font-semibold shadow-sm">
              Nenhum incidente resolvido registrado nos últimos 30 dias.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data?.history.map((hist) => (
                <div 
                  key={hist.id} 
                  className="p-4 border border-slate-200 bg-white rounded-xl flex items-center justify-between flex-wrap gap-4 text-sm shadow-sm"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-bold text-slate-800 truncate">{hist.title}</h4>
                    </div>
                    <p className="text-xs text-slate-650 pl-4">
                      Regiões: {hist.affected_regions} • Resolvido em: {hist.resolved_at ? parseUTCDate(hist.resolved_at).toLocaleString('pt-BR') : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Duração total</p>
                    <p className="font-mono font-bold text-slate-700 text-xs">{formatDuration(hist.duration_seconds)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-16 text-center border-t border-slate-200 pt-8 text-xs text-slate-500 font-bold">
        <p>© {new Date().getFullYear()} MundoNet Provedor de Internet. Todos os direitos reservados.</p>
        <p className="mt-1 font-semibold text-slate-600">Página voltada exclusivamente para o cliente final. As informações são mantidas de forma transparente e clara.</p>
      </footer>
    </div>
  );
}
