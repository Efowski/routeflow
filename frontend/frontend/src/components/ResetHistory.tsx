import React, { useState } from 'react';
import { ResetHistoryLog, Sector, Setter } from '../types';
import { Layers, Calendar, User, Trash2, Plus, Sparkles, CheckCircle2, History } from 'lucide-react';

interface ResetHistoryProps {
  logs: ResetHistoryLog[];
  sectors: Sector[];
  setters: Setter[];
  onAddLog: (newLog: Omit<ResetHistoryLog, 'id'>) => void;
}

export const ResetHistory: React.FC<ResetHistoryProps> = ({ logs, sectors, setters, onAddLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorName, setSectorName] = useState(sectors[0]?.name || '');
  const [leadSetterName, setLeadSetterName] = useState(setters[0]?.name || '');
  const [routesStripped, setRoutesStripped] = useState(15);
  const [routesSet, setRoutesSet] = useState(16);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      date: new Date().toISOString().split('T')[0],
      sectorName,
      leadSetterName,
      routesStripped: Number(routesStripped),
      routesSet: Number(routesSet),
      notes,
    });
    setIsModalOpen(false);
    setNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              AUDIT TRAIL & LOGS
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Dziennik Resetów Sektorów</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {logs.length} wpisów
            </span>
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Zarejestruj Reset</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-200 ml-3.5 sm:ml-4 space-y-5 pl-5 sm:pl-6 py-1">
        {logs.map((log) => {
          const net = log.routesSet - log.routesStripped;
          return (
            <div key={log.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#ff4d00] flex items-center justify-center shadow-2xs group-hover:scale-125 transition">
                <div className="w-1 h-1 rounded-full bg-[#ff4d00]" />
              </div>

              {/* Log Card */}
              <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs space-y-3 hover:border-zinc-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">{log.sectorName}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-500 mt-0.5">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>Head Setter: <strong className="text-zinc-800 font-semibold">{log.leadSetterName}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-zinc-700 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-[#ff4d00]" />
                      <span>{log.date}</span>
                    </span>
                  </div>
                </div>

                {/* Counts Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] font-mono uppercase block">Zdjęte</span>
                      <strong className="text-rose-700 text-xs font-mono">{log.routesStripped} dróg</strong>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] font-mono uppercase block">Nakręcone</span>
                      <strong className="text-emerald-800 text-xs font-mono">{log.routesSet} dróg</strong>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[#ff4d00]" />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] font-mono uppercase block">Bilans Netto</span>
                      <strong className="text-zinc-950 text-xs font-mono">
                        {net >= 0 ? `+${net}` : net} dróg
                      </strong>
                    </div>
                  </div>
                </div>

                {log.notes && (
                  <p className="text-[11px] text-zinc-600 italic bg-zinc-50/70 p-2 rounded-lg border border-zinc-100">
                    "{log.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Log */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-zinc-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center space-x-2">
              <History className="w-4 h-4 text-[#ff4d00]" />
              <span>Zarejestruj Przebieg Resetu</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Sektor *</label>
                <select
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Kierownik Nakręcania (Lead Setter) *</label>
                <select
                  value={leadSetterName}
                  onChange={(e) => setLeadSetterName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                >
                  {setters.map((set) => (
                    <option key={set.id} value={set.name}>
                      {set.name} ({set.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Zdjęte Drogi</label>
                  <input
                    type="number"
                    min="0"
                    value={routesStripped}
                    onChange={(e) => setRoutesStripped(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Nakręcone Nowe</label>
                  <input
                    type="number"
                    min="0"
                    value={routesSet}
                    onChange={(e) => setRoutesSet(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Notatki & Podsumowanie</label>
                <textarea
                  rows={2}
                  placeholder="np. Mycie chwytów, nowe zacięcie 7B..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold transition shadow-xs"
                >
                  Zapisz Raport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
