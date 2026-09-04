import React, { useState } from 'react';
import { SetterTask, Setter, SettingSession, HoldColor, RouteType } from '../types';
import { UserAccount } from './AuthLanding';
import { CheckSquare, User, Clock, CheckCircle2, Play, Plus, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface SetterTasksProps {
  tasks: SetterTask[];
  setters: Setter[];
  sessions: SettingSession[];
  currentUser: UserAccount | null;
  onAddTask: (newTask: Omit<SetterTask, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: SetterTask['status']) => void;
  onConvertTaskToRoute: (task: SetterTask) => void;
}

export const SetterTasks: React.FC<SetterTasksProps> = ({
  tasks,
  setters,
  sessions,
  currentUser,
  onAddTask,
  onUpdateTaskStatus,
  onConvertTaskToRoute,
}) => {
  const canCreateTasks =
    currentUser?.role === 'Gym Manager' ||
    currentUser?.role === 'Head Setter';

  const [selectedSetterFilter, setSelectedSetterFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [setterId, setSetterId] = useState(setters[0]?.id || '');
  const [sessionId, setSessionId] = useState(sessions[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RouteType>('boulder');
  const [targetGrade, setTargetGrade] = useState('6B');
  const [holdColor, setHoldColor] = useState<HoldColor>('blue');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

 const filteredTasks = tasks.filter((t) => {
  const matchesSetter =
    selectedSetterFilter === 'all' ||
    t.setterId === selectedSetterFilter;

  const matchesStatus =
    selectedStatusFilter === 'all' ||
    t.status === selectedStatusFilter;

  const matchesSession =
    selectedSessionFilter === 'all' ||
    t.sessionId === selectedSessionFilter;

  return matchesSetter && matchesStatus && matchesSession;
});

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !setterId || !sessionId) return;

    const setterObj = setters.find((s) => s.id === setterId);
    const sessionObj = sessions.find((s) => s.id === sessionId);

    onAddTask({
      sessionId,
      setterId,
      setterName: setterObj ? setterObj.name : 'Setter',
      title,
      description,
      type,
      sectorId: sessionObj ? sessionObj.sectorId : '',
      sectorName: sessionObj ? sessionObj.sectorName : 'Sector',
      
      targetGrade,
      holdColor,
      status: 'todo',
      dueDate,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const getStatusBadge = (status: SetterTask['status']) => {
    switch (status) {
      case 'todo':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>DO ZROBIENIA</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
            <Play className="w-3 h-3 text-amber-600" />
            <span>W TRAKCIE</span>
          </span>
        );
      case 'testing':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>TESTY & FORERUNNING</span>
          </span>
        );
      case 'done':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>GOTOWE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              OPERATIONAL PIPELINE
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Zadania Setterskie & Weryfikacja</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {filteredTasks.length} zadań
            </span>
          </h2>
        </div>

        {canCreateTasks && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Przydziel Zadanie</span>
          </button>
        )}
      </div>

      {/* Setters Quick Selector */}
      {setters.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {setters.map((setter) => {
          const isSelected = selectedSetterFilter === setter.id;
          return (
            <button
              key={setter.id}
              onClick={() => setSelectedSetterFilter(isSelected ? 'all' : setter.id)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2.5 ${
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                  : 'bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <img
                src={setter.avatar}
                alt={setter.name}
                className="w-8 h-8 rounded-lg object-cover border border-zinc-200/60 shrink-0"
              />
              <div className="overflow-hidden min-w-0">
                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                  {setter.name}
                </h4>
                <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-[#ff4d00]' : 'text-zinc-500'}`}>
                  {setter.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 font-mono text-[10px] uppercase">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1 text-zinc-800 text-xs font-medium focus:outline-none focus:border-[#ff4d00]"
          >
            <option value="all">Wszystkie etapy</option>
            <option value="todo">Do zrobienia</option>
            <option value="in_progress">W trakcie układania</option>
            <option value="testing">Testy & Forerunning</option>
            <option value="done">Ukończone</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
  <span className="text-zinc-400 font-mono text-[10px] uppercase">
    Sesja:
  </span>

  <select
    value={selectedSessionFilter}
    onChange={(e) => setSelectedSessionFilter(e.target.value)}
    className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1 text-zinc-800 text-xs font-medium focus:outline-none focus:border-[#ff4d00]"
  >
    <option value="all">Wszystkie sesje</option>

    {sessions.map((session) => (
      <option key={session.id} value={session.id}>
        {session.title}
      </option>
    ))}
  </select>
</div>


        <div className="text-zinc-500 text-xs font-mono">
          Łącznie: <strong className="text-zinc-950">{filteredTasks.length}</strong> zadań
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 transition"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                {getStatusBadge(task.status)}
                <span className="text-[10px] font-mono text-zinc-400">Termin: {task.dueDate}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-950">
                  {task.title}
                </h3>

                <p className="text-[11px] text-zinc-500 font-medium">
                  {task.sectorName}
                </p>

                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Sesja:{' '}
                  {sessions.find((session) => session.id === task.sessionId)?.title ||
                    'Brak sesji'}
                </p>
              </div>

              {/* Specifications Box */}
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase">Setter:</span>
                  <strong className="text-zinc-900">{task.setterName}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase">Wycena:</span>
                  <strong className="text-[#ff4d00] font-mono font-black">{task.targetGrade}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase">Kolor:</span>
                  <span className="font-bold capitalize text-zinc-800">{task.holdColor}</span>
                </div>
              </div>

              {task.description && (
                <p className="text-[11px] text-zinc-600 italic bg-zinc-50/70 p-2 rounded-lg border border-zinc-100">
                  "{task.description}"
                </p>
              )}
            </div>

            {/* Task Controls & Route Generation */}
            <div className="pt-2.5 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5">
                {task.status === 'todo' && (
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 py-1.5 rounded-lg font-bold border border-zinc-200 text-xs transition cursor-pointer"
                  >
                    Rozpocznij Nakręcanie
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, 'testing')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Przekaż do Testów (Forerun)
                  </button>
                )}
                {task.status === 'testing' && (
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, 'done')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Oznacz jako Gotowe
                  </button>
                )}
              </div>

              {task.status === 'done' && !task.createdRouteId && (
                <button
                  onClick={() => onConvertTaskToRoute(task)}
                  className="w-full bg-[#ff4d00] hover:bg-[#e04400] text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publikuj do Bazy & Generuj QR</span>
                </button>
              )}

              {task.createdRouteId && (
                <div className="text-center text-xs text-emerald-700 font-mono font-bold py-1">
                  ✓ Opublikowano w Bazie Dróg
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Task */}
      {isModalOpen && canCreateTasks && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-zinc-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-[#ff4d00]" />
              <span>Przydziel Zadanie Setterowi</span>
            </h3>

            <form onSubmit={handleSubmitNewTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Tytuł Zadania *</label>
                <input
                  type="text"
                  required
                  placeholder="np. Boulder 7A w dachu z chwytami dual-tex"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Setter *</label>
                  <select
                    value={setterId}
                    onChange={(e) => setSetterId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    {setters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Sesja *</label>
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    {sessions.map((sess) => (
                      <option key={sess.id} value={sess.id}>
                        {sess.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Docelowa Wycena</label>
                  <input
                    type="text"
                    required
                    placeholder="np. 6C+, 7A"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Kolor Chwytów</label>
                  <select
                    value={holdColor}
                    onChange={(e) => setHoldColor(e.target.value as HoldColor)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    <option value="blue">Niebieski</option>
                    <option value="red">Czerwony</option>
                    <option value="black">Czarny</option>
                    <option value="yellow">Żółty</option>
                    <option value="green">Zielony</option>
                    <option value="purple">Fioletowy</option>
                    <option value="pink">Różowy</option>
                    <option value="white">Biały</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Typ</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RouteType)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  >
                    <option value="boulder">🧩 Boulder</option>
                    <option value="rope">🧗 Lina / Obiekt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Termin (Due)</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Wytyczne & Styl Ruchu</label>
                <textarea
                  rows={2}
                  placeholder="np. Skup się na dynamice i ścisku na strukturach..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Utwórz Zadanie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
