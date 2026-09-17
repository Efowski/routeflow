import React, { useState } from 'react';
import { SettingSession, Sector, Setter } from '../types';
import { UserAccount } from './AuthLanding';
import { Calendar, Users, Target, CheckCircle, Clock, Plus } from 'lucide-react';

interface SettingPlannerProps {
  sessions: SettingSession[];
  sectors: Sector[];
  setters: Setter[];
  currentUser: UserAccount | null;
  onAddSession: (newSession: Omit<SettingSession, 'id'>) => void;
  onUpdateSessionStatus: (
    sessionId: string,
    status: 'planned' | 'in_progress' | 'completed'
  ) => void;
  onUpdateSession: (
    id: string,
    updates: Partial<SettingSession>
  ) => void;
}

type GradeRow = {
  id: string;
  grade: string;
  count: number;
};

const createGradeRow = (
  grade: string = '',
  count: number = 0
): GradeRow => ({
  id: crypto.randomUUID(),
  grade,
  count,
});

export const SettingPlanner: React.FC<SettingPlannerProps> = ({
  sessions,
  sectors,
  setters,
  currentUser,
  onAddSession,
  onUpdateSessionStatus,
  onUpdateSession,
}) => {
  const canManageSessions =
    currentUser?.role === 'Gym Manager' ||
    currentUser?.role === 'Head Setter';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [editingSession, setEditingSession] = useState<SettingSession | null>(null);
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([
    createGradeRow('6A', 0),
  ]);
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

    const targetGradeBreakdown = gradeRows.reduce<Record<string, number>>(
      (acc, row) => {
        const grade = row.grade.trim();

        if (grade) {
          acc[grade] = (acc[grade] ?? 0) + row.count;
        }

        return acc;
      },
      {}
    );

    const totalPlannedRoutes = Object.values(targetGradeBreakdown).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalPlannedRoutes !== Number(targetRouteCount)) {
      alert(
        `Suma dróg w rozkładzie wycen musi wynosić ${targetRouteCount}. Obecnie wynosi ${totalPlannedRoutes}.`
      );
      return;
    }

    const sessionData = {
      title,
      sectorId,
      sectorName: sectorObj ? sectorObj.name : 'Sector',
      scheduledDate,
      status: editingSession ? editingSession.status : ('planned' as const),
      leadSetterId,
      leadSetterName: leadSetterObj ? leadSetterObj.name : 'Head Setter',
      assignedSetterIds: editingSession
        ? editingSession.assignedSetterIds
        : [leadSetterId],
      targetRouteCount: Number(targetRouteCount),
      notes,
      targetGradeBreakdown,
    };

    if (editingSession) {
      onUpdateSession(editingSession.id, sessionData);
    } else {
      onAddSession(sessionData);
    }

    setIsModalOpen(false);
    setEditingSession(null);
    setTitle('');
    setNotes('');
    setGradeRows([createGradeRow('6A', 0)]);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
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

        {canManageSessions && (
          <button
            onClick={() => {
              setEditingSession(null);
              setGradeRows([createGradeRow('6A', 0)]);
              setIsModalOpen(true);
            }}
            className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{editingSession ? 'Edytuj sesję' : 'Nowa sesja'}</span>
          </button>
        )}
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
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
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

                  <span className="text-xs font-mono text-zinc-500">
                    {session.scheduledDate}
                  </span>
                </div>

                {/* Title & Sector */}
                <div>
                  <h3 className="text-base font-bold text-zinc-950">{session.title}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{session.sectorName}</p>
                </div>

                {/* Lead Setter & Team */}
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono text-[11px] uppercase flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Head Setter:</span>
                    </span>
                    <strong className="text-zinc-900">{session.leadSetterName}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono text-[11px] uppercase flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Cel ilościowy:</span>
                    </span>
                    <strong className="text-[#ff4d00] font-mono font-bold">
                      {session.targetRouteCount} dróg
                    </strong>
                  </div>
                </div>

                {/* Target Grade Breakdown */}
                {session.targetGradeBreakdown && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Rozkład Wycen:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(session.targetGradeBreakdown).map(([gr, count]) => (
                        <span
                          key={gr}
                          className="bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono font-semibold px-1.5 py-0.2 rounded text-[11px]"
                        >
                          {gr}: <strong className="text-zinc-950">{count}x</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {session.notes && (
                  <p className="text-xs text-zinc-600 italic bg-zinc-50/70 p-2 rounded-lg border border-zinc-100">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              {canManageSessions && (
                <button
                  onClick={() => {
                    setEditingSession(session);
                    setTitle(session.title);
                    setSectorId(session.sectorId);
                    setScheduledDate(session.scheduledDate);
                    setLeadSetterId(session.leadSetterId);
                    setTargetRouteCount(session.targetRouteCount);
                    setNotes(session.notes || '');
                    setGradeRows(
                      Object.entries(session.targetGradeBreakdown || {}).length > 0
                        ? Object.entries(session.targetGradeBreakdown || {}).map(
                            ([grade, count]) => createGradeRow(grade, count)
                          )
                        : [createGradeRow('6A', 0)]
                    );
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                >
                  Edytuj
                </button>
              )}

              {canManageSessions && (
                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                  {session.status === 'planned' && (
                    <button
                      onClick={() => onUpdateSessionStatus(session.id, 'in_progress')}
                      className="w-full bg-[#ff4d00] hover:bg-[#e04400] text-white py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      Zacznij nakręcanie
                    </button>
                  )}

                  {session.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateSessionStatus(session.id, 'completed')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Zakończ Sesję</span>
                    </button>
                  )}

                  {session.status === 'completed' && (
                    <span className="w-full text-center text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Sesja zakończona
                    </span>
                  )}
                </div>
              )}

              {session.status === 'completed' && (
                <span className="w-full text-center text-xs text-emerald-800 font-mono font-bold bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg">
                  ✓ Reset Sektora Ukończony
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: New Session */}
      {isModalOpen && canManageSessions && (
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
                <label className="block text-zinc-700 font-semibold mb-2">
                  Planowany rozkład wycen
                </label>

                <div className="space-y-2">
                  {gradeRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
                    >
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Wycena</label>
                        <input
                          type="text"
                          value={row.grade}
                          onChange={(e) =>
                            setGradeRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, grade: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="np. 6A+, 7B, 8A"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Liczba dróg</label>
                        <input
                          type="number"
                          min="0"
                          value={row.count}
                          onChange={(e) =>
                            setGradeRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, count: Number(e.target.value) }
                                  : item
                              )
                            )
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setGradeRows((prev) =>
                            prev.filter((item) => item.id !== row.id)
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold border border-zinc-200"
                      >
                        Usuń
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setGradeRows((prev) => [...prev, createGradeRow()])
                    }
                    className="w-full py-1.5 rounded-lg border border-dashed border-zinc-300 text-zinc-600 hover:bg-zinc-50 font-semibold"
                  >
                    + Dodaj wycenę
                  </button>
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
                  {editingSession ? 'Zapisz zmiany' : 'Utwórz sesję'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
