import React from 'react';
import {
  Mountain,
   
  TrendingUp,
  Users,
  Plus,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { RouteItem, Setter, SetterTask } from '../types';
import { UserAccount } from './AuthLanding';

interface DashboardOverviewProps {
  routes: RouteItem[];
   
  setters: Setter[];
  sessions?: any[];
  tasks: SetterTask[];
  logs?: any[];
  currentUser: UserAccount | null;
  onNewRouteClick: () => void;
  onOpenPlanningClick: () => void;
  onNavigateToTab: (tab: any) => void;
  
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
   routes,
   
   setters,
   sessions = [],
   tasks,
   currentUser,
   onNewRouteClick,
   onOpenPlanningClick,
   onNavigateToTab,
   
}) => {
  const canManageRoutes =
    currentUser?.role === 'Gym Manager' ||
    currentUser?.role === 'Head Setter';
  const activeRoutes = routes.filter((r) => r.status === 'active');
  const now = new Date();

const todayDate = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');

const activeSessions = sessions.filter(
  (session) =>
    session.status !== 'completed' &&
    session.scheduledDate >= todayDate
);

const overdueSessions = sessions.filter(
  (session) =>
    session.status !== 'completed' &&
    session.scheduledDate &&
    session.scheduledDate < todayDate
);

  const completedTasks = tasks.filter(
    (task) => task.status === 'done'
  );
  const inProgressTasks = tasks.filter(
  (task) => task.status === 'in_progress'
);
   

  const overdueTasks = tasks.filter(
  (task) =>
    task.dueDate &&
    task.dueDate < todayDate &&
    task.status !== 'done' &&
    !task.createdRouteId
);

 


const upcomingSessions = activeSessions
  .filter(
    (session) =>
      session.scheduledDate &&
      session.scheduledDate >= todayDate
  )
  .sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate)
  )
  .slice(0, 5);

const sessionsMissingTasks = activeSessions
  .map((session) => {
    const sessionTasks = tasks.filter(
      (task) => task.sessionId === session.id
    );

    const missingTasks = Math.max(
      session.targetRouteCount - sessionTasks.length,
      0
    );

    return {
      session,
      taskCount: sessionTasks.length,
      missingTasks,
    };
  })
  .filter((item) => item.missingTasks > 0);


  const testingTasks = tasks.filter(
    (task) => task.status === 'testing'
  );

  const todoTasks = tasks.filter(
    (task) => task.status === 'todo'
  );

  const publishedTasks = tasks.filter(
    (task) => Boolean(task.createdRouteId)
  );
    const totalAscents = routes.reduce(
    (acc, r) => acc + (r.ascentCount || 0),
    0
  );  
  const getSessionStats = (session: any) => {
  const sessionTasks = tasks.filter(
    (task) => task.sessionId === session.id
  );

  const todo = sessionTasks.filter(
    (task) => task.status === 'todo'
  ).length;

  const inProgress = sessionTasks.filter(
    (task) => task.status === 'in_progress'
  ).length;

  const testing = sessionTasks.filter(
    (task) => task.status === 'testing'
  ).length;

  const done = sessionTasks.filter(
    (task) => task.status === 'done'
  ).length;

  const published = sessionTasks.filter(
    (task) => Boolean(task.createdRouteId)
  ).length;

  const completionPercent =
    session.targetRouteCount > 0
      ? Math.round(
          (published / session.targetRouteCount) * 100
        )
      : 0;

  return {
    totalTasks: sessionTasks.length,
    todo,
    inProgress,
    testing,
    done,
    publishedTasks: published,
    completionPercent,
  };
};

  const avgAge =
    activeRoutes.length > 0
      ? Math.round(activeRoutes.reduce((acc, r) => acc + r.ageDays, 0) / activeRoutes.length)
      : 0;

  const expiredRoutesCount = activeRoutes.filter((r) => r.ageDays >= 45).length;
  const freshnessPercent = activeRoutes.length > 0 ? Math.round(((activeRoutes.length - expiredRoutesCount) / activeRoutes.length) * 100) : 100;

  // 14-day sends telemetry data - do zrobienia potem
  

  const upNextTasks = tasks
  .filter((task) => !task.createdRouteId)
  .filter((task) => task.status !== 'done')
  .slice(0, 4);

    const completedSessions = sessions
  .filter((session) => session.status === 'completed')
  .sort((a, b) =>
    b.scheduledDate.localeCompare(a.scheduledDate)
    )
  .slice(0, 3);
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
          {canManageRoutes && (
            <button
              onClick={onNewRouteClick}
              className="px-3.5 py-1.5 bg-[#ff4d00] hover:bg-[#e04400] text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nowa Droga</span>
            </button>
          )}
        </div>
      </div>

      

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
              {activeRoutes.length}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              Łącznie dróg:{' '}
              <strong className="text-zinc-900 font-mono">
                {routes.length}
              </strong>
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
              Łączna liczba przejść (QR + App)
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
              {setters.length}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              Aktywne sesje:{' '}
              <strong className="text-zinc-900 font-mono">
                {activeSessions.length}
              </strong>
            </div>
          </div>
        </div>
      </div>
      {/* Active Setting Sessions */}
      <div className="bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#ff4d00]" />

            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
              Aktywne Sesje Setterskie
            </h2>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {activeSessions.length} aktywnych
          </span>
        </div>

        {activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeSessions.map((session) => {
              const stats = getSessionStats(session);

              return (
                <div
                  key={session.id}
                  className="border border-zinc-200/80 rounded-xl p-3.5 bg-zinc-50/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950">
                        {session.title}
                      </h3>

                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {session.sectorName}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        session.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {session.status === 'in_progress'
                        ? 'W TRAKCIE'
                        : 'PLANOWANA'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-mono uppercase text-[9px]">
                        Lead Setter
                      </span>

                      <strong className="text-zinc-900">
                        {session.leadSetterName || 'Nie przypisano'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-mono uppercase text-[9px]">
                        Data
                      </span>

                      <strong className="text-zinc-900 font-mono">
                        {session.scheduledDate}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-mono uppercase text-[9px]">
                        Zadania
                      </span>

                      <strong className="text-zinc-900 font-mono">
                        {stats.totalTasks} / {session.targetRouteCount}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-mono uppercase text-[9px]">
                        Opublikowane
                      </span>

                      <strong className="text-[#ff4d00] font-mono">
                        {stats.publishedTasks} / {session.targetRouteCount}
                      </strong>
</div>

    <div className="pt-2 mt-2 border-t border-zinc-200">
      <div className="text-[9px] uppercase font-mono text-zinc-400 mb-1.5">
        Task Progress
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-white border border-zinc-200 rounded-md px-2 py-1.5 text-center">
          <div className="text-[9px] font-mono text-zinc-400 uppercase">
            Todo
          </div>
          <div className="text-xs font-mono font-bold text-zinc-900">
            {stats.todo}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 text-center">
          <div className="text-[9px] font-mono text-amber-600 uppercase">
            W toku
          </div>
          <div className="text-xs font-mono font-bold text-amber-800">
            {stats.inProgress}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 text-center">
          <div className="text-[9px] font-mono text-blue-600 uppercase">
            Testy
          </div>
          <div className="text-xs font-mono font-bold text-blue-800">
            {stats.testing}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 text-center">
          <div className="text-[9px] font-mono text-emerald-600 uppercase">
            Gotowe
          </div>
          <div className="text-xs font-mono font-bold text-emerald-800">
            {stats.done}
          </div>
        </div>
      </div>
    </div>


      <div className="pt-2 mt-2 border-t border-zinc-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase font-mono text-zinc-400">
          Completion
        </span>

        <strong className="text-[10px] font-mono text-zinc-900">
          {stats.completionPercent}%
        </strong>
      </div>

      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ff4d00] rounded-full transition-all"
          style={{
            width: `${Math.min(stats.completionPercent, 100)}%`,
          }}
        />
      </div>

      <div className="text-[9px] font-mono text-zinc-400 mt-1">
        {stats.publishedTasks} / {session.targetRouteCount} tras opublikowanych
      </div>
    </div>                      


                    
 
                  </div>

                  <button
                    onClick={() => onNavigateToTab('planner')}
                    className="w-full py-1.5 px-2.5 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-semibold rounded-lg border border-zinc-200 transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Otwórz sesję</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-400 font-mono py-6">
            Brak aktywnych sesji setterskich
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#ff4d00]" />

            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
              Upcoming Sessions
            </h2>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {upcomingSessions.length}
          </span>
        </div>

        {upcomingSessions.length > 0 ? (
          <div className="space-y-2">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="text-xs font-bold text-zinc-950">
                    {session.title}
                  </h3>

                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {session.sectorName} · {session.leadSetterName || 'Brak Lead Settera'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[9px] uppercase font-mono text-zinc-400">
                    Data
                  </div>

                  <div className="text-[11px] font-mono font-bold text-zinc-900">
                    {session.scheduledDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-400 font-mono py-4">
            Brak nadchodzących sesji
          </div>
        )}

        <button
          onClick={() => onNavigateToTab('planner')}
          className="text-[11px] font-semibold text-[#ff4d00] hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>Przejdź do planera</span>
          <ChevronRight className="w-3 h-3" />
        </button>
</div>
    {/* Attention Required */}

    {/* Completed Sessions */}
    <div className="bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />

          <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
            Completed Sessions
          </h2>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {completedSessions.length}
        </span>
      </div>

      {completedSessions.length > 0 ? (
        <div className="space-y-2">
          {completedSessions.map((session) => (
            <div
              key={session.id}
              className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3"
            >
              <div>
                <h3 className="text-xs font-bold text-zinc-950">
                  {session.title}
                </h3>

                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {session.sectorName} · {session.leadSetterName || 'Brak Lead Settera'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-[9px] uppercase font-mono text-emerald-600">
                  Zakończona
                </div>

                <div className="text-[11px] font-mono font-bold text-emerald-700">
                  {session.scheduledDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-xs text-zinc-400 font-mono py-4">
          Brak zakończonych sesji
        </div>
      )}

      <button
        onClick={() => onNavigateToTab('planner')}
        className="text-[11px] font-semibold text-[#ff4d00] hover:underline flex items-center space-x-1 cursor-pointer"
      >
        <span>Przejdź do planera</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
<div className="bg-white p-4.5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
  <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
    <div className="flex items-center space-x-2">
      <Zap className="w-4 h-4 text-red-500" />

      <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono">
        Attention Required
      </h2>
    </div>

    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
      {overdueTasks.length + sessionsMissingTasks.length + overdueSessions.length}
    </span>
  </div>

  {/* Overdue Tasks */}
  {overdueTasks.length > 0 ? (
    <div className="space-y-2">
      {overdueTasks.map((task) => (
        <div
          key={task.id}
          className="p-3 rounded-lg border border-red-200 bg-red-50/60 flex items-center justify-between gap-3"
        >
          <div>
            <h3 className="text-xs font-bold text-zinc-950">
              {task.title}
            </h3>

            <p className="text-[10px] text-zinc-500 mt-0.5">
              {task.sectorName} · {task.setterName}
            </p>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase font-mono text-red-500">
              Po terminie
            </div>

            <div className="text-[11px] font-mono font-bold text-red-700">
              {task.dueDate}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-xs text-zinc-400 font-mono py-4">
      Brak zaległych zadań
    </div>
  )}

  {/* Sessions Missing Tasks */}
  {sessionsMissingTasks.length > 0 && (
    <div className="space-y-2 pt-2 border-t border-zinc-100">
      <div className="text-[10px] uppercase font-mono text-zinc-400">
        Sesje z brakującymi taskami
      </div>

      {sessionsMissingTasks.map(({ session, taskCount, missingTasks }) => (
  <div
    key={session.id}
    className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-3"
  >
    <div>
      <h3 className="text-xs font-bold text-zinc-950">
        {session.title}
      </h3>

      <p className="text-[10px] text-zinc-500 mt-0.5">
        {session.sectorName}
      </p>
    </div>

    <div className="text-right">
      <div className="text-[9px] uppercase font-mono text-amber-600">
        Brakuje tasków
      </div>

      <div className="text-[11px] font-mono font-bold text-amber-800">
        {taskCount} / {session.targetRouteCount}
      </div>

      <div className="text-[9px] font-mono text-amber-700">
        brakuje: {missingTasks}
      </div>
    </div>
  </div>
))}
    </div>
  )}
      {/* Overdue Sessions */}
    {overdueSessions.length > 0 && (
      <div className="space-y-2 pt-2 border-t border-zinc-100">
        <div className="text-[10px] uppercase font-mono text-zinc-400">
          Sesje po terminie
        </div>

        {overdueSessions.map((session) => (
          <div
            key={session.id}
            className="p-3 rounded-lg border border-red-200 bg-red-50/60 flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="text-xs font-bold text-zinc-950">
                {session.title}
              </h3>

              <p className="text-[10px] text-zinc-500 mt-0.5">
                {session.sectorName} · {session.leadSetterName || 'Brak Lead Settera'}
              </p>
            </div>

            <div className="text-right">
              <div className="text-[9px] uppercase font-mono text-red-500">
                Sesja po terminie
              </div>

              <div className="text-[11px] font-mono font-bold text-red-700">
                {session.scheduledDate}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
 


  <button
    onClick={() => onNavigateToTab('tasks')}
    className="text-[11px] font-semibold text-[#ff4d00] hover:underline flex items-center space-x-1 cursor-pointer"
  >
    <span>Przejdź do zadań</span>
    <ChevronRight className="w-3 h-3" />
  </button>
</div>
</div>
  );
};
