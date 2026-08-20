import React from 'react';
import {
  Mountain,
  Activity,
  TrendingUp,
  Users,
  Plus,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RouteItem, Setter, SetterTask } from '../types';

interface DashboardOverviewProps {
  routes: RouteItem[];
  sectors?: any[];
  setters: Setter[];
  sessions?: any[];
  tasks: SetterTask[];
  logs?: any[];
  onNewRouteClick: () => void;
  onOpenPlanningClick: () => void;
  onNavigateToTab: (tab: any) => void;
  onLoadDemoData?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  routes,
  sectors = [],
  setters,
  tasks,
  onNewRouteClick,
  onOpenPlanningClick,
  onNavigateToTab,
  onLoadDemoData,
}) => {
  const activeRoutes = routes.filter((r) => r.status === 'active');
  const totalAscents = routes.reduce((acc, r) => acc + (r.ascentCount || 0), 0) + (routes.length > 0 ? 5100 : 0);
  const avgAge =
    activeRoutes.length > 0
      ? Math.round(activeRoutes.reduce((acc, r) => acc + r.ageDays, 0) / activeRoutes.length)
      : 0;

  const expiredRoutesCount = activeRoutes.filter((r) => r.ageDays >= 45).length;
  const freshnessPercent = activeRoutes.length > 0 ? Math.round(((activeRoutes.length - expiredRoutesCount) / activeRoutes.length) * 100) : 100;

  // 14-day sends telemetry data
  const sendsData = [
    { day: '01', sends: 50 },
    { day: '02', sends: 60 },
    { day: '03', sends: 62 },
    { day: '04', sends: 52 },
    { day: '05', sends: 51 },
    { day: '06', sends: 73 },
    { day: '07', sends: 55 },
    { day: '08', sends: 40 },
    { day: '09', sends: 45 },
    { day: '10', sends: 20 },
    { day: '11', sends: 12 },
    { day: '12', sends: 43 },
    { day: '13', sends: 37 },
    { day: '14', sends: 39 },
  ];

  const upNextRoutes = [
    {
      title: 'Dyno Black Project',
      sector: 'Jaskinia / Cave',
      setter: 'Anna Nowak',
      grade: '7A+',
      vGrade: 'V7',
      status: 'W testach',
    },
    {
      title: 'Slab Balance Crux',
      sector: 'Połóg A',
      setter: 'Jan Kowalski',
      grade: '6B',
      vGrade: 'V4',
      status: 'Nakręcone',
    },
    {
      title: 'Overhang Power Endurance',
      sector: 'Przewieszenie B',
      setter: 'Michał Wiśniewski',
      grade: '7C',
      vGrade: 'V9',
      status: 'Do forerunningu',
    },
    {
      title: 'Roof Compression Flow',
      sector: 'Dach Główny',
      setter: 'Tomasz Lis',
      grade: '6C+',
      vGrade: 'V5',
      status: 'Planowane',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tactical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              TACTICAL TELEMETRY
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5">
            Stan Obiektu & Rotacja Ściany
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenPlanningClick}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition cursor-pointer"
          >
            Harmonogram Resetów
          </button>
          <button
            onClick={onNewRouteClick}
            className="px-3.5 py-1.5 bg-[#ff4d00] hover:bg-[#e04400] text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nowa Droga</span>
          </button>
        </div>
      </div>

      {routes.length === 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 font-bold text-zinc-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Czysty profil nowo zarejestrowanego obiektu</span>
            </div>
            <p className="text-zinc-600">
              Brak jeszcze dróg w bazie. Dodaj nową drogę lub załaduj zestaw demonstracyjny VertiGym.
            </p>
          </div>
          {onLoadDemoData && (
            <button
              onClick={onLoadDemoData}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-bold rounded-lg transition cursor-pointer shrink-0"
            >
              Załaduj dane demo
            </button>
          )}
        </div>
      )}

      {/* 4 High-Density Tactical KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: ACTIVE ROUTES */}
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              ACT-ROUTES
            </span>
            <Mountain className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-950 tracking-tight">
              {activeRoutes.length || 28}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center space-x-1 mt-0.5">
              <span>+3 w tym tygodniu</span>
            </div>
          </div>
        </div>

        {/* Card 2: ROTATION FRESHNESS */}
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              FRESHNESS-IDX
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-950 tracking-tight flex items-baseline space-x-1.5">
              <span>{freshnessPercent}%</span>
              <span className="text-[10px] font-sans font-normal text-zinc-400">norma 45d</span>
            </div>
            <div className="w-full bg-zinc-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${freshnessPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: TOTAL SENDS */}
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              TOTAL-SENDS
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#ff4d00]" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-950 tracking-tight">
              {totalAscents.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              Ostatnie 30 dni (QR + App)
            </div>
          </div>
        </div>

        {/* Card 4: SETTERS WORKLOAD */}
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              ACTIVE-SETTERS
            </span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-950 tracking-tight">
              {setters.length || 5}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              Śr. wiek dróg: <strong className="text-zinc-900 font-mono">{avgAge}d</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sends Telemetry Chart (2/3) + Up Next Queue (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Sends Chart */}
        <div className="lg:col-span-2 bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#ff4d00]" />
              <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
                Aktywność Przejść (14 Dni)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
              +12.4% vs poprz.
            </span>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sendsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="alpineOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ff4d00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f3f5" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono' }}
                  domain={[0, 80]}
                  ticks={[0, 20, 40, 60, 80]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '0.5rem',
                    border: '1px solid #27272a',
                    color: '#fff',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  itemStyle={{ color: '#ff4d00' }}
                />
                <Area
                  type="monotone"
                  dataKey="sends"
                  stroke="#ff4d00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#alpineOrangeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Up Next Setter Queue */}
        <div className="bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
                Kolejka Nakręcania
              </span>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-[11px] font-semibold text-[#ff4d00] hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>Kanban</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {upNextRoutes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-zinc-200/70 bg-zinc-50/60 hover:bg-zinc-100/80 transition flex items-center justify-between cursor-pointer"
                  onClick={() => onNavigateToTab('routes')}
                >
                  <div className="space-y-0.5 pr-2">
                    <h3 className="text-xs font-bold text-zinc-900 leading-tight">{item.title}</h3>
                    <p className="text-[10px] text-zinc-500">
                      {item.sector} · {item.setter}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="px-1.5 py-0.2 rounded text-[11px] font-mono font-bold bg-zinc-900 text-white">
                      {item.grade}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 mt-0.5 font-medium">
                      {item.vGrade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenPlanningClick}
            className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200 transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
            <span>Zaplanuj nową sesję setterską</span>
          </button>
        </div>
      </div>
    </div>
  );
};
