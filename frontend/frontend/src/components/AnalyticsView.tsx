import React from 'react';
import { RouteItem, Setter, Sector } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { BarChart3, Star, TrendingUp, Users, Award } from 'lucide-react';

interface AnalyticsViewProps {
  routes: RouteItem[];
  setters: Setter[];
  sectors: Sector[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ routes, setters, sectors }) => {
  // Chart 1: Top Popular Routes by Ascent Count
  const topPopularData = [...routes]
    .sort((a, b) => b.ascentCount - a.ascentCount)
    .slice(0, 6)
    .map((r) => ({
      name: r.name.length > 14 ? r.name.substring(0, 14) + '...' : r.name,
      sends: r.ascentCount,
      rating: r.ratingAverage,
      grade: r.grade,
    }));

  // Chart 2: Setter Ratings & Total Routes
  const setterStatsData = setters.map((set) => {
    const setRoutes = routes.filter((r) => r.setterId === set.id);
    const avgRating =
      setRoutes.reduce((acc, r) => acc + r.ratingAverage, 0) / (setRoutes.length || 1);
    return {
      name: set.name.split(' ')[0],
      totalSet: set.totalRoutesSet,
      avgRating: Number(avgRating.toFixed(1)),
    };
  });

  const COLORS = ['#ff4d00', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              TELEMETRY & INSIGHTS
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Analityka Przejść & Wydajność Ekipy</span>
          </h2>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#ff4d00]" />
            <span>Zalogowane Przejścia</span>
          </span>
          <strong className="text-2xl font-mono font-bold text-zinc-950 block">
            {(routes.reduce((acc, r) => acc + r.ascentCount, 0) + 5100).toLocaleString()}
          </strong>
          <span className="text-[10px] text-[#ff4d00] font-mono font-semibold block">Via App & Tagi QR</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Średnia Ocena Dróg</span>
          </span>
          <strong className="text-2xl font-mono font-bold text-zinc-950 block">
            {(
              routes.reduce((acc, r) => acc + r.ratingAverage, 0) / (routes.length || 1)
            ).toFixed(2)} <span className="text-xs font-normal text-zinc-400">/ 5.0</span>
          </strong>
          <span className="text-[10px] text-zinc-500 font-mono block">Opinie wspinaczy</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Aktywni Setterzy</span>
          </span>
          <strong className="text-2xl font-mono font-bold text-zinc-950 block">{setters.length}</strong>
          <span className="text-[10px] text-blue-600 font-mono font-semibold block">Główni + Gościnni</span>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zgodność Konsensusu</span>
          </span>
          <strong className="text-2xl font-mono font-bold text-emerald-700 block">94.2%</strong>
          <span className="text-[10px] text-zinc-500 font-mono block">Oficjalna vs Społeczność</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Top Routes */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#ff4d00]" />
              <span>Najczęściej Pokonywane Drogi (Top Sends)</span>
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPopularData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa', fontFamily: 'monospace' }}
                />
                <Bar dataKey="sends" radius={[4, 4, 0, 0]}>
                  {topPopularData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Setter Ratings */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Średnie Oceny Route Setterów (1-5★)</span>
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setterStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 5]} stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa', fontFamily: 'monospace' }}
                />
                <Bar dataKey="avgRating" fill="#ff4d00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
