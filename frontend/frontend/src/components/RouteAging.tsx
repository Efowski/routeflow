import React, { useState } from 'react';
import { RouteItem, Sector } from '../types';
import { Clock, AlertTriangle, ShieldCheck, Trash2, ArrowRight, Layers, Plus } from 'lucide-react';

interface RouteAgingProps {
  routes: RouteItem[];
  sectors: Sector[];
  onRetireRoute: (routeId: string) => void;
  onNavigateToPlanner: (sectorId: string) => void;
  onAddSector?: (newSector: { name: string; type: 'bouldering' | 'rope_wall' | 'training'; maxCapacity: number; colorCode: string }) => void;
}

export const RouteAging: React.FC<RouteAgingProps> = ({
  routes,
  sectors,
  onRetireRoute,
  onNavigateToPlanner,
  onAddSector,
}) => {
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [sectorName, setSectorName] = useState('');
  const [sectorType, setSectorType] = useState<'bouldering' | 'rope_wall' | 'training'>('bouldering');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [colorCode, setColorCode] = useState('#ff4d00');

  const handleAddSectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName) return;

    if (onAddSector) {
      onAddSector({
        name: sectorName,
        type: sectorType,
        maxCapacity: Number(maxCapacity),
        colorCode,
      });
    }

    setIsSectorModalOpen(false);
    setSectorName('');
  };

  const activeRoutes = routes.filter((r) => r.status === 'active');

  const ageCategories = {
    fresh: activeRoutes.filter((r) => r.ageDays < 15),
    prime: activeRoutes.filter((r) => r.ageDays >= 15 && r.ageDays < 45),
    old: activeRoutes.filter((r) => r.ageDays >= 45 && r.ageDays < 60),
    expired: activeRoutes.filter((r) => r.ageDays >= 60),
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              LIFECYCLE ROTATION MATRIX
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Rotacja & Sektory Ściany</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              Cykl: 45 dni
            </span>
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {onAddSector && (
            <button
              onClick={() => setIsSectorModalOpen(true)}
              className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Dodaj Sektor</span>
            </button>
          )}
        </div>
      </div>

      {/* Age Categories Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Fresh */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
              FRESH (&lt;14d)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-950">{ageCategories.fresh.length}</div>
          <p className="text-[11px] text-zinc-500">Najwyższa frekwencja i liczba prób.</p>
        </div>

        {/* Prime */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
              PRIME (15-44d)
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-950">{ageCategories.prime.length}</div>
          <p className="text-[11px] text-zinc-500">Ustabilizowany konsensus wycen.</p>
        </div>

        {/* Old */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
              WARN (45-59d)
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#ff4d00]">{ageCategories.old.length}</div>
          <p className="text-[11px] text-zinc-500">Planowany demontaż w 1-2 tyg.</p>
        </div>

        {/* Expired */}
        <div className="bg-white border border-rose-200/80 bg-rose-50/20 rounded-xl p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">
              EXPIRED (&gt;60d)
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-600">{ageCategories.expired.length}</div>
          <p className="text-[11px] text-rose-700 font-medium">Wymaga natychmiastowego resetu.</p>
        </div>
      </div>

      {/* Sector Aging Heatmap & Status */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#ff4d00]" />
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
              Analiza Rotacji Sektorów Ściany
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {sectors.map((sec) => {
            const secRoutes = activeRoutes.filter((r) => r.sectorId === sec.id);
            const total = secRoutes.length;
            const avgAge = total > 0 ? Math.round(secRoutes.reduce((acc, r) => acc + r.ageDays, 0) / total) : 0;
            const expiredCountInSec = secRoutes.filter((r) => r.ageDays >= 45).length;

            return (
              <div key={sec.id} className="bg-zinc-50/70 p-3.5 rounded-lg border border-zinc-200/70 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-zinc-950 text-sm">{sec.name}</h4>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200/80 text-zinc-700">
                        {sec.type || 'boulder'}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      Ostatni reset: <strong className="text-zinc-800 font-mono">{sec.lastResetDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">Średni wiek:</span>
                      <strong className={`text-xs font-mono ${avgAge >= 45 ? 'text-rose-600 font-bold' : 'text-zinc-900 font-bold'}`}>
                        {avgAge} dni
                      </strong>
                    </div>

                    <button
                      onClick={() => onNavigateToPlanner(sec.id)}
                      className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                    >
                      <span>Planuj Reset</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden flex">
                    {secRoutes.map((r) => {
                      let bg = 'bg-emerald-500';
                      if (r.ageDays >= 60) bg = 'bg-rose-500';
                      else if (r.ageDays >= 45) bg = 'bg-amber-500';
                      else if (r.ageDays >= 15) bg = 'bg-blue-500';

                      return (
                        <div
                          key={r.id}
                          className={`h-full ${bg} border-r border-white`}
                          style={{ width: `${100 / (total || 1)}%` }}
                          title={`${r.name} (${r.grade}) - ${r.ageDays} dni`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{total} aktywnych dróg w sektorze</span>
                    {expiredCountInSec > 0 && (
                      <span className="text-rose-600 font-bold">
                        ⚠️ {expiredCountInSec} dróg do wymiany (&gt;45d)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent Reset List */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4.5 shadow-2xs space-y-3.5">
        <div className="flex items-center space-x-2 border-b border-zinc-100 pb-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
            Drogi Wymagające Zdemontowania (&gt;45 dni)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...ageCategories.old, ...ageCategories.expired].map((route) => (
            <div
              key={route.id}
              className="bg-zinc-50/70 border border-rose-200/70 p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                    style={{ backgroundColor: route.holdColorHex }}
                  />
                  <strong className="text-zinc-950 text-xs font-bold">{route.name}</strong>
                  <span className="font-mono font-bold text-zinc-900 bg-zinc-200/80 px-1.5 py-0.2 rounded text-[10px]">
                    {route.grade}
                  </span>
                </div>
                <p className="text-zinc-500 text-[11px]">{route.sectorName}</p>
                <div className="text-zinc-400 text-[10px] flex items-center space-x-2 font-mono">
                  <span>{route.setterName}</span>
                  <span>•</span>
                  <span>{route.dateSet}</span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1.5">
                <span className="text-rose-700 font-mono font-bold text-xs bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                  {route.ageDays}d
                </span>

                <button
                  onClick={() => onRetireRoute(route.id)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Zdejmij</span>
                </button>
              </div>
            </div>
          ))}

          {ageCategories.old.length === 0 && ageCategories.expired.length === 0 && (
            <div className="col-span-full text-center py-6 text-zinc-500 text-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
              <span>Wszystkie drogi w obiekcie są świeże i spełniają normy rotacji!</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Dodawanie nowego Sektora */}
      {isSectorModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-zinc-800">
            <button
              onClick={() => setIsSectorModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#ff4d00]" />
              <span>Dodaj Nowy Sektor Ściany</span>
            </h3>

            <form onSubmit={handleAddSectorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nazwa Sektora *</label>
                <input
                  type="text"
                  required
                  placeholder="np. Sektor D - Zacięcie & Połóg"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Typ Sektora</label>
                  <select
                    value={sectorType}
                    onChange={(e) => setSectorType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    <option value="bouldering">Bouldering</option>
                    <option value="rope_wall">Ściana Linowa</option>
                    <option value="training">Strefa Treningowa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Pojemność (Dróg)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Kolor Sektora na Mapie (HEX)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSectorModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold transition shadow-xs"
                >
                  Zapisz Sektor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
