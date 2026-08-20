import React, { useState } from 'react';
import { SettingSession, Sector, Setter } from '../types';
import { Calendar, Users, Target, CheckCircle, Clock, Plus, ArrowRight, Play, Sparkles } from 'lucide-react';

interface SettingPlannerProps {
  sessions: SettingSession[];
  sectors: Sector[];
  setters: Setter[];
  onAddSession: (newSession: Omit<SettingSession, 'id'>) => void;
  onUpdateSessionStatus: (sessionId: string, status: 'planned' | 'in_progress' | 'completed') => void;
}

export const SettingPlanner: React.FC<SettingPlannerProps> = ({
  sessions,
  sectors,
  setters,
  onAddSession,
  onUpdateSessionStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [leadSetterId, setLeadSetterId] = useState(setters[0]?.id || '');
  const [targetRouteCount, setTargetRouteCount] = useState(12);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sectorId || !scheduledDate) return;

    const sectorObj = sectors.find((s) => s.id === sectorId);
    const leadSetterObj = setters.find((set) => set.id === leadSetterId);

    onAddSession({
      title,
      sectorId,
      sectorName: sectorObj ? sectorObj.name : 'Sector',
      scheduledDate,
      status: 'planned',
      leadSetterId,
      leadSetterName: leadSetterObj ? leadSetterObj.name : 'Head Setter',
      assignedSetterIds: [leadSetterId],
      targetRouteCount: Number(targetRouteCount),
      notes,
      targetGradeBreakdown: { '6A': 4, '6B': 4, '6C': 2, '7A': 2 },
    });

    setIsModalOpen(false);
    setTitle('');
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
              OPERATIONAL SCHEDULING
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Harmonogram Nakręcania & Sesje</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {sessions.length} sesji
            </span>
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Zaplanuj Sesję</span>
        </button>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sessions.map((session) => {
          const isCompleted = session.status === 'completed';
          const isInProgress = session.status === 'in_progress';

          return (
            <div
              key={session.id}
              className={`bg-white border rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between transition ${
                isInProgress
                  ? 'border-amber-300 bg-amber-50/15'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/15'
                  : 'border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                      isInProgress
                        ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {isInProgress ? (
                      <>
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>W TRAKCIE</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-700" />
                        <span>ZAKOŃCZONA</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>ZAPLANOWANA</span>
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-mono text-zinc-500">{session.scheduledDate}</span>
                </div>

                {/* Title & Sector */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">{session.title}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{session.sectorName}</p>
                </div>

                {/* Lead Setter & Team */}
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-mono text-[10px] uppercase flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Head Setter:</span>
                    </span>
                    <strong className="text-zinc-900">{session.leadSetterName}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-mono text-[10px] uppercase flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Cel ilościowy:</span>
                    </span>
                    <strong className="text-[#ff4d00] font-mono font-bold">{session.targetRouteCount} dróg</strong>
                  </div>
                </div>

                {/* Target Grade Breakdown */}
                {session.targetGradeBreakdown && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Rozkład Wycen:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(session.targetGradeBreakdown).map(([gr, count]) => (
                        <span
                          key={gr}
                          className="bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono font-semibold px-1.5 py-0.2 rounded text-[10px]"
                        >
                          {gr}: <strong className="text-zinc-950">{count}x</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {session.notes && (
                  <p className="text-[11px] text-zinc-600 italic bg-zinc-50/70 p-2 rounded-lg border border-zinc-100">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                {session.status === 'planned' && (
                  <button
                    onClick={() => onUpdateSessionStatus(session.id, 'in_progress')}
                    className="w-full bg-[#ff4d00] hover:bg-[#e04400] text-white py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3" />
                    <span>Rozpocznij Nakręcanie</span>
                  </button>
                )}

                {session.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateSessionStatus(session.id, 'completed')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Zakończ & Oznacz Sektor</span>
                  </button>
                )}

                {session.status === 'completed' && (
                  <span className="w-full text-center text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg">
                    ✓ Reset Sektora Ukończony
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Session */}
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
              <Calendar className="w-4 h-4 text-[#ff4d00]" />
              <span>Zaplanuj Sesję Nakręcania</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Tytuł Sesji *</label>
                <input
                  type="text"
                  required
                  placeholder="np. Reset Sektora C (Dach & Przewieszenie)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Sektor *</label>
                  <select
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Data Nakręcania *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Head Setter *</label>
                  <select
                    value={leadSetterId}
                    onChange={(e) => setLeadSetterId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    {setters.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.name} ({set.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Liczba Dróg (Cel)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={targetRouteCount}
                    onChange={(e) => setTargetRouteCount(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Wytyczne & Notatki</label>
                <textarea
                  rows={2}
                  placeholder="np. Skupienie na chwytach dual-tex, balanse na tarciu..."
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
                  Utwórz Sesję
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
