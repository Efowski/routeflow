import React, { useState } from 'react';
import { Setter, GymUser } from '../types';
import { Users, Mail, Plus, Shield, CheckCircle, Flame } from 'lucide-react';

interface SettersViewProps {
  setters: Setter[];
  gymUsers: GymUser[];
  onSelectSetter: (setterId: string) => void;

  onAddSetter?: (newSetter: {
    userId: string;
    name: string;
    email: string;
    role: string;
    specialties: string[];
  }) => void;

  onAddSetterWithUser?: (newSetter: {
    name: string;
    email: string;
    password: string;
    userRole: 'route_setter' | 'head_setter';
    role: string;
    specialties: string[];
  }) => void;
}

export const SettersView: React.FC<SettersViewProps> = ({ setters, onSelectSetter, onAddSetter,onAddSetterWithUser, gymUsers, }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Route Setter');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [accountMode, setAccountMode] = useState<'existing' | 'new'>('existing');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'route_setter' | 'head_setter'>('route_setter');
  const [specialtiesStr, setSpecialtiesStr] = useState('Baldery, Połogi');

  const availableGymUsers = gymUsers.filter(
  (user) => !setters.some((setter) => setter.userId === user.id)
);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const specialties = specialtiesStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (accountMode === 'existing') {
    if (availableGymUsers.length === 0) {
      return;
    }

    if (!selectedUserId || !name || !email) {
      alert('Wybierz konto użytkownika.');
      return;
    }

    if (onAddSetter) {
      onAddSetter({
        userId: selectedUserId,
        name,
        email,
        role,
        specialties,
      });
    }
  }

  if (accountMode === 'new') {
    if (!name || !email || !newUserPassword) {
      alert('Uzupełnij dane nowego użytkownika.');
      return;
    }

    if (onAddSetterWithUser) {
      onAddSetterWithUser({
        name,
        email,
        password: newUserPassword,
        userRole: newUserRole,
        role,
        specialties,
      });
    }
  }

  setIsModalOpen(false);
  setSelectedUserId('');
  setName('');
  setEmail('');
  setNewUserPassword('');
  setAccountMode('existing');
};
 


  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              ROUTESETTING SQUAD
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Zespół Route Setterów & Obciążenie</span>
            <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {setters.length} osób
            </span>
          </h2>
        </div>

        {onAddSetter && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Dodaj Settera</span>
          </button>
        )}
      </div>

      {setters.length === 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-10 text-center space-y-2">
          <Users className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">Brak zarejestrowanych setterów</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Kliknij przycisk "Dodaj Settera", aby utworzyć profil nowego członka ekipy. Dane zostaną zapisane w bazie Django REST API.
          </p>
        </div>
      )}

      {/* Setters Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {setters.map((setter) => (
          <div
            key={setter.id}
            className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3.5 group"
          >
            <div className="space-y-3">
             <div className="flex items-center space-x-3">
  {setter.avatar ? (
    <img
      src={setter.avatar}
      alt={setter.name}
      className="w-12 h-12 rounded-xl object-cover border border-zinc-200/80 shadow-2xs ring-1 ring-zinc-100"
    />
  ) : (
    <div className="w-12 h-12 rounded-xl border border-zinc-200/80 shadow-2xs ring-1 ring-zinc-100 flex items-center justify-center">
      <span className="text-sm font-medium">
        {setter.name?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  )}

  <div className="min-w-0 flex-1">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-zinc-950 truncate group-hover:text-[#ff4d00] transition">
        {setter.name}
      </h3>
    </div>

    <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-zinc-100 text-zinc-700 border border-zinc-200 mt-0.5">
      {setter.role}
    </span>

    <p className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1 truncate">
      <Mail className="w-3 h-3 shrink-0 text-zinc-400" />
      <span className="truncate">{setter.email || '—'}</span>
    </p>
    </div>
  </div>

              {/* Specialties */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Specjalizacje
                </span>
                <div className="flex flex-wrap gap-1">
                  {setter.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200/70"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-zinc-100 text-center text-xs">
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/60">
                  <span className="text-zinc-400 block text-[9px] font-mono uppercase">
                    Historia
                  </span>
                  <strong className="text-zinc-950 font-mono text-xs">
                    {setter.totalRoutesSet}
                  </strong>
                </div>
</div>
            </div>

            <button
              onClick={() => onSelectSetter(setter.id)}
              className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold rounded-lg border border-zinc-200 transition cursor-pointer"
            >
              Przydzielone Zadania
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Add Setter */}
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
              <Users className="w-4 h-4 text-[#ff4d00]" />
              <span>Dodaj Nowego Route Settera</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Sposób dodania settera
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAccountMode('existing')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                    accountMode === 'existing'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Istniejące konto
                </button>

                <button
                  type="button"
                  onClick={() => setAccountMode('new')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                    accountMode === 'new'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Utwórz nowe konto
                </button>
              </div>
            </div>
                        {accountMode === 'existing' && (
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Konto użytkownika *
              </label>

              <select
                value={selectedUserId}
                onChange={(e) => {
                  const userId = e.target.value;
                  setSelectedUserId(userId);

                  const selectedUser = gymUsers.find(
                    (user) => user.id === userId
                  );

                  if (selectedUser) {
                    setName(selectedUser.name);
                    setEmail(selectedUser.email);
                  }
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="">Wybierz konto użytkownika</option>

                {availableGymUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} — {user.email}
                  </option>
                ))}
              </select>

              {availableGymUsers.length === 0 && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  Wszyscy użytkownicy w tym gym mają już profil settera.
                </p>
              )}
            </div>
                        )}
          {accountMode === 'new' && (
          <div className="space-y-3">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Imię i nazwisko *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Piotr Król"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Adres email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. piotr@wspinanie.pl"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Hasło tymczasowe *
              </label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Rola konta *
              </label>
              <select
                value={newUserRole}
                onChange={(e) =>
                  setNewUserRole(e.target.value as 'route_setter' | 'head_setter')
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="route_setter">Route Setter</option>
                <option value="head_setter">Head Setter</option>
              </select>
            </div>
          </div>
        )}

                        {accountMode === 'existing' && (
                    <>
                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Imię i Nazwisko *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="np. Piotr Król"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Adres Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="np. piotr@wspinanie.pl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                        />
                      </div>
                    </>
                  )}

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-zinc-700 font-semibold mb-1">Rola / Uprawnienia</label>
                          <input
                            type="text"
                            required
                            placeholder="np. Head Setter, Setter, Trainee"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-700 font-semibold mb-1">Specjalizacje</label>
                          <input
                            type="text"
                            placeholder="Baldery, Skoki, Zacięcia"
                            value={specialtiesStr}
                            onChange={(e) => setSpecialtiesStr(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
                          />
                        </div>
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
                          disabled={ accountMode === 'existing' &&   availableGymUsers.length === 0}
                          className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Zapisz Settera
                        </button>
                      </div>
                    </form>
          </div>
        </div>
      )}
    </div>
  );
};
