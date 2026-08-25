import React, { useState, useEffect } from 'react';
import {
  INITIAL_ROUTES,
  INITIAL_SECTORS,
  INITIAL_SETTERS,
  INITIAL_SETTING_SESSIONS,
  INITIAL_SETTER_TASKS,
  INITIAL_RESET_LOGS,
  DEMO_ROUTES,
  DEMO_SECTORS,
  DEMO_SETTERS,
} from './data/mockData';
import {
  apiLogout, 
  apiFetchRoutes,
  apiCreateRoute,
  apiUpdateRouteStatus,
  apiFetchSectors,
  apiCreateSector,
  apiFetchSetters,
  apiCreateSetter,
  apiFetchSessions,
  apiCreateSession,
  apiFetchTasks,
  apiCreateTask,
  apiUpdateTaskStatus,
  apiFetchResetLogs,
  apiCreateResetLog,
} from './services/apiService';
import { RouteItem, Sector, Setter, SettingSession, SetterTask, ResetHistoryLog } from './types';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { RouteDatabase } from './components/RouteDatabase';
import { ResetHistory } from './components/ResetHistory';
import { SettingPlanner } from './components/SettingPlanner';
import { SetterTasks } from './components/SetterTasks';
import { SettersView } from './components/SettersView';
import { RouteAging } from './components/RouteAging';
import { AnalyticsView } from './components/AnalyticsView';
import { QRCodeManager } from './components/QRCodeManager';
import { DjangoArchitectureModal } from './components/DjangoArchitectureModal';
import { AuthLanding, UserAccount } from './components/AuthLanding';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthLanding, setShowAuthLanding] = useState(true);

  // Default logged in user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [setters, setSetters] = useState<Setter[]>([]);
  const [sessions, setSessions] = useState<SettingSession[]>([]);
  const [tasks, setTasks] = useState<SetterTask[]>([]);
  const [logs, setLogs] = useState<ResetHistoryLog[]>([]);

  const [selectedRouteForQR, setSelectedRouteForQR] = useState<RouteItem | null>(null);

  // Fetch initial data from Django REST API backend
  const loadDataFromBackend = async () => {
    const backendRoutes = await apiFetchRoutes();
    const backendSectors = await apiFetchSectors();
    const backendSetters = await apiFetchSetters();
    const backendSessions = await apiFetchSessions();
    const backendTasks = await apiFetchTasks();
    const backendLogs = await apiFetchResetLogs();

    setRoutes(backendRoutes);
    setSectors(backendSectors);
    setSetters(backendSetters);
    setSessions(backendSessions);
    setTasks(backendTasks);
    setLogs(backendLogs);
  };

  useEffect(() => {
    loadDataFromBackend();
  }, []);

  // Derived Metrics
  const activeRoutes = routes.filter((r) => r.status === 'active');
  const expiredCount = activeRoutes.filter((r) => r.ageDays >= 45).length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  // Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowAuthLanding(false);
    setActiveTab('dashboard');
    loadDataFromBackend();

     
  };

  const handleLoadDemoData = () => {
    setRoutes(DEMO_ROUTES);
    setSectors(DEMO_SECTORS);
    setSetters(DEMO_SETTERS);
  };

  const handleLogout = () => {
  apiLogout();
  setCurrentUser(null);
  setShowAuthLanding(true);
};

  const handleAddRoute = async (
    newRouteData: Omit<RouteItem, 'id' | 'ageDays' | 'qrCodeUrl' | 'ratingAverage' | 'ratingCount' | 'ascentCount'>
  ) => {
    // Attempt Django REST API post
    const createdApiRoute = await apiCreateRoute(newRouteData);

    const newId = createdApiRoute?.id || `route-${Date.now()}`;
    const newRoute: RouteItem = createdApiRoute || {
      ...newRouteData,
      id: newId,
      ageDays: 0,
      ratingAverage: 5.0,
      ratingCount: 1,
      ascentCount: 0,
      qrCodeUrl: `https://vertigym.app/r/${newId}`,
    };

    setRoutes([newRoute, ...routes]);
  };

  const handleRetireRoute = async (routeId: string) => {
    await apiUpdateRouteStatus(routeId, 'deprecated');
    setRoutes(routes.map((r) => (r.id === routeId ? { ...r, status: 'deprecated' } : r)));
  };

  const handleAddLog = async (newLogData: Omit<ResetHistoryLog, 'id'>) => {
    const created = await apiCreateResetLog(newLogData);
    const newLog: ResetHistoryLog = created || {
      ...newLogData,
      id: `log-${Date.now()}`,
    };
    setLogs([newLog, ...logs]);
  };

  const handleAddSession = async (newSessionData: Omit<SettingSession, 'id'>) => {
    const created = await apiCreateSession(newSessionData);
    const newSession: SettingSession = created || {
      ...newSessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions([newSession, ...sessions]);
  };

  const handleUpdateSessionStatus = (sessionId: string, status: 'planned' | 'in_progress' | 'completed') => {
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)));
  };

  const handleAddTask = async (newTaskData: Omit<SetterTask, 'id' | 'createdAt'>) => {
    const created = await apiCreateTask(newTaskData);
    const newTask: SetterTask = created || {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: SetterTask['status']) => {
    await apiUpdateTaskStatus(taskId, status);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const handleConvertTaskToRoute = async (task: SetterTask) => {
    const newRouteData = {
      name: task.title,
      type: task.type,
      grade: task.targetGrade,
      sectorId: sectors[0]?.id || '',
      sectorName: task.sectorName,
      holdColor: task.holdColor,
      holdColorHex:
        task.holdColor === 'blue'
          ? '#3b82f6'
          : task.holdColor === 'red'
          ? '#ef4444'
          : task.holdColor === 'black'
          ? '#18181b'
          : '#eab308',
      setterId: task.setterId,
      setterName: task.setterName,
      dateSet: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      description: task.description,
      tags: ['New', 'Fresh Set'],
    };

    const createdApiRoute = await apiCreateRoute(newRouteData);
    const newId = createdApiRoute?.id || `route-${Date.now()}`;
    const newRoute: RouteItem = createdApiRoute || {
      ...newRouteData,
      id: newId,
      ageDays: 0,
      ratingAverage: 5.0,
      ratingCount: 1,
      ascentCount: 0,
      qrCodeUrl: `https://vertigym.app/r/${newId}`,
    };

    setRoutes([newRoute, ...routes]);
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, createdRouteId: newId } : t)));
  };

  const handleAddSector = async (newSectorData: {
    name: string;
    type: 'bouldering' | 'rope_wall' | 'training';
    maxCapacity: number;
    colorCode: string;
  }) => {
    const created = await apiCreateSector(newSectorData);
    const newSector: Sector = created || {
      id: `sec-${Date.now()}`,
      name: newSectorData.name,
      type: newSectorData.type,
      maxCapacity: newSectorData.maxCapacity,
      currentRouteCount: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      nextScheduledReset: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      colorCode: newSectorData.colorCode,
    };
    setSectors([...sectors, newSector]);
  };

  const handleAddSetter = async (newSetterData: {
    name: string;
    email: string;
    role: string;
    specialties: string[];
  }) => {
    const created = await apiCreateSetter(newSetterData);
    const newSetter: Setter = created || {
      id: `set-${Date.now()}`,
      name: newSetterData.name,
      email: newSetterData.email,
      role: newSetterData.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      specialties: newSetterData.specialties,
      assignedTasksCount: 0,
      completedTasksCount: 0,
      totalRoutesSet: 0,
    };
    setSetters([...setters, newSetter]);
  };

  const handleSelectRouteForQR = (route: RouteItem) => {
    setSelectedRouteForQR(route);
    setActiveTab('qrcode');
  };

  if (showAuthLanding || !currentUser) {
    return <AuthLanding onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTasksCount={activeTasksCount}
        expiredCount={expiredCount}
        currentUser={currentUser}
        onOpenLanding={() => setShowAuthLanding(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewRouteClick={() => setActiveTab('routes')}
          onOpenPlanningClick={() => setActiveTab('planner')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              routes={routes}
              sectors={sectors}
              setters={setters}
              sessions={sessions}
              tasks={tasks}
              logs={logs}
              onNewRouteClick={() => setActiveTab('routes')}
              onOpenPlanningClick={() => setActiveTab('planner')}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onLoadDemoData={handleLoadDemoData}
            />
          )}

          {activeTab === 'routes' && (
            <RouteDatabase
              routes={routes}
              sectors={sectors}
              setters={setters}
              onSelectRouteForQR={handleSelectRouteForQR}
              onRetireRoute={handleRetireRoute}
              onAddRoute={handleAddRoute}
            />
          )}

          {activeTab === 'aging' && (
            <RouteAging
              routes={routes}
              sectors={sectors}
              onRetireRoute={handleRetireRoute}
              onNavigateToPlanner={() => setActiveTab('planner')}
              onAddSector={handleAddSector}
            />
          )}

          {activeTab === 'planner' && (
            <SettingPlanner
              sessions={sessions}
              sectors={sectors}
              setters={setters}
              onAddSession={handleAddSession}
              onUpdateSessionStatus={handleUpdateSessionStatus}
            />
          )}

          {activeTab === 'tasks' && (
            <SetterTasks
              tasks={tasks}
              setters={setters}
              sessions={sessions}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onConvertTaskToRoute={handleConvertTaskToRoute}
            />
          )}

          {activeTab === 'setters' && (
            <SettersView
              setters={setters}
              onSelectSetter={() => setActiveTab('tasks')}
              onAddSetter={handleAddSetter}
            />
          )}

          {activeTab === 'history' && (
            <ResetHistory logs={logs} sectors={sectors} setters={setters} onAddLog={handleAddLog} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView routes={routes} setters={setters} sectors={sectors} />
          )}

          {activeTab === 'qrcode' && (
            <QRCodeManager
              routes={routes}
              selectedRouteForQR={selectedRouteForQR}
              onClearSelection={() => setSelectedRouteForQR(null)}
            />
          )}

          {activeTab === 'django' && <DjangoArchitectureModal />}
        </main>
      </div>
    </div>
  );
}
