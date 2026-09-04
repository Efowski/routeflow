import React, { useState, useMemo } from 'react';
import { RouteItem, Sector, Setter, RouteType, HoldColor } from '../types';
import { UserAccount } from './AuthLanding';
import {
  Search,
  Filter,
  QrCode,
  Star,
  Calendar,
  User,
  Trash2,
  Info,
  Plus,
  AlertCircle,
  Mountain,
  LayoutGrid,
  List,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface RouteDatabaseProps {
  routes: RouteItem[];
  sectors: Sector[];
  setters: Setter[];
  currentUser: UserAccount | null;
  onSelectRouteForQR: (route: RouteItem) => void;
  onRetireRoute: (routeId: string) => void;
  onAddRoute: (
    newRoute: Omit<
      RouteItem,
      'id' | 'ageDays' | 'qrCodeUrl' | 'ratingAverage' | 'ratingCount' | 'ascentCount'
    >
  ) => void;
  onUpdateRoute: (
  routeId: string,
  updatedRoute: Partial<RouteItem>
  ) => Promise<void>;  
}

export const RouteDatabase: React.FC<RouteDatabaseProps> = ({
  routes,
  sectors,
  setters,
  currentUser,
  onSelectRouteForQR,
  onRetireRoute,
  onAddRoute,
  onUpdateRoute,
}) => {
  const canManageRoutes =
    currentUser?.role === 'Gym Manager' ||
    currentUser?.role === 'Head Setter';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<RouteType | 'all'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedSetter, setSelectedSetter] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'deprecated'>(
    'active'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedRouteDetail, setSelectedRouteDetail] = useState<RouteItem | null>(null);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Route Form State
const [editName, setEditName] = useState('');
const [editType, setEditType] = useState<RouteType>('boulder');
const [editGrade, setEditGrade] = useState('');
const [editVGrade, setEditVGrade] = useState('');
const [editSectorId, setEditSectorId] = useState('');
const [editHoldColor, setEditHoldColor] = useState<HoldColor>('blue');
const [editSetterId, setEditSetterId] = useState('');
const [editDescription, setEditDescription] = useState('');

  // New Route Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<RouteType>('boulder');
  const [grade, setGrade] = useState('6A');
  const [vGrade, setVGrade] = useState('V3');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');
  const [holdColor, setHoldColor] = useState<HoldColor>('blue');
  const [setterId, setSetterId] = useState(setters[0]?.id || '');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Dyno, Tech');

  const colorHexMap: Record<HoldColor, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    green: '#10b981',
    black: '#18181b',
    purple: '#a855f7',
    orange: '#ff4d00',
    white: '#f4f4f5',
    pink: '#ec4899',
    wood: '#a16207',
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.setterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sectorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'all' || r.type === selectedType;
      const matchesSector = selectedSector === 'all' || r.sectorId === selectedSector;
      const matchesSetter = selectedSetter === 'all' || r.setterId === selectedSetter;
      const matchesColor = selectedColor === 'all' || r.holdColor === selectedColor;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = r.status === 'active';
      else if (statusFilter === 'deprecated') matchesStatus = r.status === 'deprecated';
      else if (statusFilter === 'expired') matchesStatus = r.status === 'active' && r.ageDays >= 45;

      return (
        matchesSearch &&
        matchesType &&
        matchesSector &&
        matchesSetter &&
        matchesColor &&
        matchesStatus
      );
    });
  }, [routes, searchTerm, selectedType, selectedSector, selectedSetter, selectedColor, statusFilter]);

  const handleSubmitNewRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sectorId || !setterId) return;

    const sectorObj = sectors.find((s) => s.id === sectorId);
    const setterObj = setters.find((s) => s.id === setterId);

    onAddRoute({
      name,
      type,
      grade,
      vGrade: type === 'boulder' ? vGrade : undefined,
      sectorId,
      sectorName: sectorObj ? sectorObj.name : 'Sector',
      holdColor,
      holdColorHex: colorHexMap[holdColor] || '#3b82f6',
      setterId,
      setterName: setterObj ? setterObj.name : 'Setter',
      dateSet: new Date().toISOString().split('T')[0],
      status: 'active',
      description,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIsAddModalOpen(false);
    setName('');
    setDescription('');
  };

  const handleStartEditRoute = () => {
  if (!selectedRouteDetail) return;

  setEditName(selectedRouteDetail.name);
  setEditType(selectedRouteDetail.type);
  setEditGrade(selectedRouteDetail.grade);
  setEditVGrade(selectedRouteDetail.vGrade || '');
  setEditSectorId(selectedRouteDetail.sectorId);
  setEditHoldColor(selectedRouteDetail.holdColor);
  setEditSetterId(selectedRouteDetail.setterId);
  setEditDescription(selectedRouteDetail.description || '');

  setIsEditingRoute(true);
};

const handleSubmitEditRoute = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedRouteDetail) return;
  if (!editName || !editSectorId || !editSetterId) return;

  const sectorObj = sectors.find((s) => s.id === editSectorId);
  const setterObj = setters.find((s) => s.id === editSetterId);

  await onUpdateRoute(selectedRouteDetail.id, {
    name: editName,
    type: editType,
    grade: editGrade,
    vGrade: editType === 'boulder' ? editVGrade : undefined,
    sectorId: editSectorId,
    sectorName: sectorObj?.name || '',
    holdColor: editHoldColor,
    holdColorHex: colorHexMap[editHoldColor] || '#ef4444',
    setterId: editSetterId,
    setterName: setterObj?.name || '',
    description: editDescription,
  });

  setSelectedRouteDetail(null);
  setIsEditingRoute(false);
};

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              INVENTORY CATALOG
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Baza Dróg i Boulderów</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {filteredRoutes.length} pozycji
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Widok Siatki"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Widok Tabeli"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canManageRoutes && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nowa Droga</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filtruj po nazwie, wycenie (np. 6B, V4), setterze lub sektorze..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4d00] focus:bg-white transition"
            />
          </div>

          {/* Type Select */}
          <div className="flex items-center space-x-1 bg-zinc-100/80 border border-zinc-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setSelectedType('boulder')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                selectedType === 'boulder'
                  ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Boulder
            </button>
            <button
              onClick={() => setSelectedType('rope')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                selectedType === 'rope'
                  ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Lina
            </button>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-[#ff4d00] cursor-pointer"
          >
            <option value="active">Aktywne na ścianie</option>
            <option value="expired">Do rotacji (&gt;45 dni)</option>
            <option value="deprecated">Zdemontowane</option>
            <option value="all">Wszystkie statusy</option>
          </select>
        </div>

        {/* Sub-filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-100 text-xs">
          <div>
            <label className="block text-zinc-400 text-[10px] font-mono uppercase mb-1">
              Sektor Ściany
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-[#ff4d00] cursor-pointer"
            >
              <option value="all">Wszystkie Sektory</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-mono uppercase mb-1">
              Autor (Routesetter)
            </label>
            <select
              value={selectedSetter}
              onChange={(e) => setSelectedSetter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-[#ff4d00] cursor-pointer"
            >
              <option value="all">Wszyscy Setterzy</option>
              {setters.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] font-mono uppercase mb-1">
              Kolor Chwytów
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-[#ff4d00] cursor-pointer"
            >
              <option value="all">Wszystkie Kolory</option>
              <option value="black">Czarny (Black)</option>
              <option value="blue">Niebieski (Blue)</option>
              <option value="red">Czerwony (Red)</option>
              <option value="yellow">Żółty (Yellow)</option>
              <option value="green">Zielony (Green)</option>
              <option value="white">Biały (White)</option>
              <option value="purple">Fioletowy (Purple)</option>
              <option value="pink">Różowy (Pink)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRoutes.map((route) => {
            const isOld = route.ageDays >= 45;
            const isVeryOld = route.ageDays >= 60;

            return (
              <div
                key={route.id}
                className={`bg-white border rounded-xl p-4 shadow-2xs transition-all duration-150 flex flex-col justify-between space-y-3 group ${
                  route.status === 'deprecated'
                    ? 'border-zinc-200 opacity-60'
                    : isVeryOld
                    ? 'border-rose-300 bg-rose-50/20'
                    : isOld
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top line: Hold swatch, Type badge, Age */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-zinc-300 shadow-2xs"
                        style={{ backgroundColor: route.holdColorHex }}
                        title={`Kolor chwytów: ${route.holdColor}`}
                      />
                      <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700">
                        {route.type === 'boulder' ? 'BOULDER' : 'ROPE'}
                      </span>
                      {route.wallLineNumber && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          #{route.wallLineNumber}
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded ${
                        isVeryOld
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isOld
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {route.ageDays}d
                    </div>
                  </div>

                  {/* Route Title & Grade */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 group-hover:text-[#ff4d00] transition">
                        {route.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 mt-0.5">
                        {route.sectorName}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black font-mono tracking-tight text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {route.grade}
                      </span>
                      {route.vGrade && (
                        <span className="text-[9px] font-mono text-zinc-400 font-bold mt-0.5">
                          {route.vGrade}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Setter & Date */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span className="truncate max-w-[120px]">{route.setterName}</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono text-[10px]">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{route.dateSet}</span>
                    </div>
                  </div>

                  {/* Ratings & Ascents */}
                  <div className="mt-2 flex items-center justify-between text-[11px] font-medium bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                    <div className="flex items-center space-x-1 text-amber-600 font-mono text-[10px]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{route.ratingAverage}</span>
                      <span className="text-zinc-400">({route.ratingCount})</span>
                    </div>
                    <div className="text-zinc-600 font-mono text-[10px]">
                      <strong className="text-zinc-900">{route.ascentCount}</strong> przejść
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-zinc-100 flex items-center space-x-1.5 text-xs">
                  <button
                    onClick={() => setSelectedRouteDetail(route)}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition cursor-pointer border border-zinc-200"
                  >
                    <Info className="w-3 h-3 text-[#ff4d00]" />
                    <span>Szczegóły</span>
                  </button>

                  <button
                    onClick={() => onSelectRouteForQR(route)}
                    className="bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 p-1.5 rounded-lg transition cursor-pointer"
                    title="Drukuj Tag QR"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {canManageRoutes && route.status === 'active' && (
                    <button
                      onClick={() => onRetireRoute(route.id)}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 p-1.5 rounded-lg transition cursor-pointer"
                      title="Zdejmij ze ściany (Zdemontuj)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tactical Data Table View */
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-[10px] font-mono uppercase text-zinc-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Kolor & Typ</th>
                  <th className="py-2.5 px-3">Nazwa Drogi</th>
                  <th className="py-2.5 px-3">Wycena</th>
                  <th className="py-2.5 px-3">Sektor</th>
                  <th className="py-2.5 px-3">Setter</th>
                  <th className="py-2.5 px-3">Wiek / Data</th>
                  <th className="py-2.5 px-3">Przejścia</th>
                  <th className="py-2.5 px-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-zinc-50/70 transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                          style={{ backgroundColor: route.holdColorHex }}
                        />
                        <span className="font-mono text-[10px] text-zinc-600 uppercase">
                          {route.type === 'boulder' ? 'B' : 'R'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-zinc-950">
                      {route.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                      {route.grade} {route.vGrade && <span className="text-zinc-400 font-normal">({route.vGrade})</span>}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600">{route.sectorName}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{route.setterName}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">
                      <span className={route.ageDays >= 45 ? 'text-rose-600 font-bold' : 'text-zinc-600'}>
                        {route.ageDays}d
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-800">{route.ascentCount}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setSelectedRouteDetail(route)}
                          className="p-1 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100"
                        >
                          <Info className="w-3.5 h-3.5 text-[#ff4d00]" />
                        </button>
                        <button
                          onClick={() => onSelectRouteForQR(route)}
                          className="p-1 text-zinc-500 hover:text-zinc-950 rounded hover:bg-zinc-100"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRoutes.length === 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-10 text-center text-zinc-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto" />
          <p className="text-sm font-bold text-zinc-800">Nie znaleziono dróg spełniających kryteria.</p>
          <p className="text-xs text-zinc-400">Spróbuj zmienić parametry filtrów lub wpisane słowa kluczowe.</p>
        </div>
      )}

      {/* Modal: Details Slide-over / Modal */}
      
      {/* Modal: Details Slide-over / Modal */}
{selectedRouteDetail && (
  <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-xl relative space-y-4 text-zinc-800">

      <button
        onClick={() => {
          setSelectedRouteDetail(null);
          setIsEditingRoute(false);
        }}
        className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
      >
        ✕
      </button>

      {isEditingRoute ? (
  <form onSubmit={handleSubmitEditRoute} className="space-y-3 text-xs">
  <h3 className="text-base font-bold text-zinc-950">
    Edytuj drogę
  </h3>

  <div>
    <label className="block text-zinc-700 font-semibold mb-1">
      Nazwa Drogi / Boulderu *
    </label>
    <input
      type="text"
      required
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
    />
  </div>

  <div className="grid grid-cols-2 gap-2.5">
    <div>
      <label className="block text-zinc-700 font-semibold mb-1">
        Typ
      </label>
      <select
        value={editType}
        onChange={(e) => setEditType(e.target.value as RouteType)}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
      >
        <option value="boulder">🧩 Boulder</option>
        <option value="rope">🧗 Lina / Obiekt</option>
      </select>
    </div>

    <div>
      <label className="block text-zinc-700 font-semibold mb-1">
        Wycena
      </label>
      <input
        type="text"
        required
        value={editGrade}
        onChange={(e) => setEditGrade(e.target.value)}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
      />
    </div>
  </div>

  {editType === 'boulder' && (
    <div>
      <label className="block text-zinc-700 font-semibold mb-1">
        Wycena V-Scale
      </label>
      <input
        type="text"
        value={editVGrade}
        onChange={(e) => setEditVGrade(e.target.value)}
        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono focus:outline-none focus:border-[#ff4d00]"
      />
    </div>
  )}

  <div className="grid grid-cols-2 gap-2.5">
    <div>
      <label className="block text-zinc-700 font-semibold mb-1">
        Sektor *
      </label>
      <select
        value={editSectorId}
        onChange={(e) => setEditSectorId(e.target.value)}
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
      <label className="block text-zinc-700 font-semibold mb-1">
        Kolor Chwytów
      </label>
      <select
        value={editHoldColor}
        onChange={(e) => setEditHoldColor(e.target.value as HoldColor)}
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

  <div>
    <label className="block text-zinc-700 font-semibold mb-1">
      Routesetter *
    </label>
    <select
      value={editSetterId}
      onChange={(e) => setEditSetterId(e.target.value)}
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
    <label className="block text-zinc-700 font-semibold mb-1">
      Opis / Wskazówki
    </label>
    <textarea
      rows={3}
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
    />
  </div>

  <div className="pt-2 flex items-center justify-end space-x-2">
    <button
      type="button"
      onClick={() => setIsEditingRoute(false)}
      className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition"
    >
      Anuluj
    </button>

    <button
      type="submit"
      className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold transition shadow-xs"
    >
      Zapisz zmiany
    </button>
  </div>
</form>
) : (
  <>
    <div className="flex items-center space-x-3">
      <div
        className="w-4 h-4 rounded-full border border-zinc-300"
        style={{ backgroundColor: selectedRouteDetail.holdColorHex }}
      />
      <div>
        <h3 className="text-base font-bold text-zinc-950">
          {selectedRouteDetail.name}
        </h3>
        <p className="text-xs text-zinc-500">
          {selectedRouteDetail.sectorName}
        </p>
      </div>
      <span className="ml-auto text-sm font-black font-mono text-zinc-950 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-lg">
        {selectedRouteDetail.grade}
      </span>
    </div>

    <div className="grid grid-cols-4 gap-2 text-center text-xs">
      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
        <span className="text-[10px] text-zinc-400 font-mono block uppercase">
          Setter
        </span>
        <strong className="text-zinc-900 block truncate text-[11px]">
          {selectedRouteDetail.setterName}
        </strong>
      </div>

      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
        <span className="text-[10px] text-zinc-400 font-mono block uppercase">
          Data
        </span>
        <strong className="text-zinc-900 block text-[11px] font-mono">
          {selectedRouteDetail.dateSet}
        </strong>
      </div>

      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
        <span className="text-[10px] text-zinc-400 font-mono block uppercase">
          Wiek
        </span>
        <strong className="text-[#ff4d00] block text-[11px] font-mono">
          {selectedRouteDetail.ageDays}d
        </strong>
      </div>

      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
        <span className="text-[10px] text-zinc-400 font-mono block uppercase">
          Sends
        </span>
        <strong className="text-emerald-700 block text-[11px] font-mono">
          {selectedRouteDetail.ascentCount}
        </strong>
      </div>
    </div>

    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 text-xs space-y-0.5">
      <span className="font-semibold text-zinc-700">
        Notatki techniczne settera:
      </span>
      <p className="text-zinc-600 italic">
        {selectedRouteDetail.description || 'Brak dodatkowych uwag.'}
      </p>
    </div>

    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 flex items-center justify-between text-xs">
      <div>
        <span className="text-[10px] text-zinc-400 font-mono uppercase block">
          Wycena Oficjalna:
        </span>
        <strong className="text-zinc-950 font-mono">
          {selectedRouteDetail.grade}
        </strong>
      </div>

      <div className="text-right">
        <span className="text-[10px] text-zinc-400 font-mono uppercase block">
          Konsensus Wspinaczy:
        </span>
        <strong className="text-[#ff4d00] font-mono">
          {selectedRouteDetail.consensusGrade || selectedRouteDetail.grade}
        </strong>
      </div>
    </div>

    <div className="flex items-center space-x-2 pt-1">
      {canManageRoutes && (
        <button
          onClick={handleStartEditRoute}
          className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer border border-zinc-200"
        >
          Edytuj
        </button>
      )}

      <button
        onClick={() => {
          onSelectRouteForQR(selectedRouteDetail);
          setSelectedRouteDetail(null);
        }}
        className="flex-1 bg-[#ff4d00] hover:bg-[#e04400] text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
      >
        <QrCode className="w-3.5 h-3.5" />
        <span>Generuj Etykietę QR</span>
      </button>
    </div>
  </>
)}
      
    </div>
  </div>
)}

      {/* Modal: Add New Route */}
      {isAddModalOpen && canManageRoutes && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-3.5 text-zinc-800">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-zinc-950 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#ff4d00]" />
              <span>Dodaj Nową Drogę do Bazy</span>
            </h3>

            <form onSubmit={handleSubmitNewRoute} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nazwa Drogi / Boulderu *</label>
                <input
                  type="text"
                  required
                  placeholder="np. Crimson Overhang, Project 7A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
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
                  <label className="block text-zinc-700 font-semibold mb-1">Wycena (Francuska)</label>
                  <input
                    type="text"
                    required
                    placeholder="np. 6A, 6C+, 7A+"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              {type === 'boulder' && (
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Wycena V-Scale (Opcjonalnie)</label>
                  <input
                    type="text"
                    placeholder="np. V3, V5, V8"
                    value={vGrade}
                    onChange={(e) => setVGrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              )}

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

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Routesetter *</label>
                <select
                  value={setterId}
                  onChange={(e) => setSetterId(e.target.value)}
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
                <label className="block text-zinc-700 font-semibold mb-1">Opis / Wskazówki</label>
                <textarea
                  rows={2}
                  placeholder="np. Dynamiczny wyskok z podhaczeniem pięty..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold transition shadow-xs"
                >
                  Zapisz drogę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
