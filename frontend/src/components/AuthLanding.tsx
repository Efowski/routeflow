import React, { useState } from 'react';
import {
  Mountain,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  UserPlus,
  LogIn,
  Layers,
  BarChart3,
  QrCode,
  Users,
  Compass,
  Footprints,
  Tag,
} from 'lucide-react';

import { apiLogin } from '../services/apiService';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'Gym Manager' | 'Head Setter' | 'Route Setter';
  gymName: string;
  avatarUrl?: string;
  isNewRegistration?: boolean;
}

interface AuthLandingProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gymName, setGymName] = useState('');
  const [role, setRole] = useState<'Gym Manager' | 'Head Setter' | 'Route Setter'>('Gym Manager');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccessNotice, setApiSuccessNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setApiSuccessNotice('');

    if (!email || !password) {
      setErrorMessage('Proszę wypełnić adres e-mail i hasło.');
      return;
    }

    if (isRegisterMode && (!fullName || !gymName)) {
      setErrorMessage('Proszę podać imię i nazwisko zarządcy oraz nazwę obiektu.');
      return;
    }

    setIsLoading(true);

    const nameParts = (fullName || 'Zarządca').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const backendRoleMap: Record<string, string> = {
      'Gym Manager': 'gym_manager',
      'Head Setter': 'head_setter',
      'Route Setter': 'route_setter',
    };

    let createdUser: UserAccount | null = null;

    if (isRegisterMode) {
      // Attempt registration request to Django backend REST API
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/accounts/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            username: email,
            password,
            first_name: firstName,
            last_name: lastName,
            role: backendRoleMap[role] ,
            gym_name: gymName  ,
          }),
        });

        if (response.ok) {
        const data = await response.json();
          const roleMap: Record<string, UserAccount['role']> = {
        gym_manager: 'Gym Manager',
        head_setter: 'Head Setter',
        route_setter: 'Route Setter',
      };

      const mappedRole = roleMap[data.user.role];

      if (!mappedRole) {
        throw new Error(`Unsupported user role: ${data.user.role}`);
      }

  if (!data.id) {
    throw new Error('Registration response does not contain user ID.');
  }

  setApiSuccessNotice('Konto pomyślnie utworzone w bazie Django!');

  createdUser = {
    id: String(data.id),
    email: data.email || email,
    name: `${data.first_name || firstName} ${data.last_name || lastName}`.trim() || fullName,
    role,
    gymName: gymName || '',
    avatarUrl: '',
    isNewRegistration: true,
  };

        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('Django Register API returned error:', errData);
        }
      } catch (err) {
        console.log('Django server not reachable, fallback to browser state mode', err);
      }
    } else {
      // Attempt login request to Django backend REST API
      const data = await apiLogin(email, password);

  if (data?.user) {
  const roleMap: Record<string, UserAccount['role']> = {
    gym_manager: 'Gym Manager',
    head_setter: 'Head Setter',
    route_setter: 'Route Setter',
  };

  const mappedRole = roleMap[data.user.role];

  if (!mappedRole) {
    throw new Error(`Unsupported user role: ${data.user.role}`);
  }

  createdUser = {
    id: String(data.user.id),
    email: data.user.email,
    name: data.user.name || email,
    role: mappedRole,
    gymName: data.user.gym_name || '',
    avatarUrl: '',
    isNewRegistration: false,
  };
} else {
    setErrorMessage('Nieprawidłowy adres e-mail lub hasło.');
  }
    }

    // Fallback user object if Django backend is not currently running
    if (!createdUser) {
  setIsLoading(false);
  setErrorMessage(
    isRegisterMode
      ? 'Nie udało się utworzyć konta.'
      : 'Nie udało się zalogować. Sprawdź email i hasło.'
  );
  return;
}

  setIsLoading(false);
  onLoginSuccess(createdUser);

     
  };

 

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col justify-between antialiased selection:bg-[#ff4d00] selection:text-white relative">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black border border-zinc-800 shadow-2xs shrink-0">
              <span className="text-[#ff4d00] text-sm">▲</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-zinc-950 tracking-tight">VERTI GYM</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  ROUTE OS
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                CLIMBING GYM SYSTEM • 2026 EDITION
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-zinc-100"
            >
              {isRegisterMode ? 'Masz konto? Zaloguj się' : 'Rejestracja obiektu'}
            </button>
            
          </div>
        </div>
      </header>

      {/* Hero & Authentication Main Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        
        {/* Left Column: Climbing-Themed Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Climbing Grade Badges Banner */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-mono font-bold text-zinc-700">
              <Compass className="w-3 h-3 text-[#ff4d00]" />
              <span>BOULDERING & SPORT CLIMBING</span>
            </span>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] font-bold">
              <span className="px-2 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">5C</span>
              <span className="px-2 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">6B+</span>
              <span className="px-2 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">7A</span>
              <span className="px-2 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">7C+</span>
              <span className="px-2 py-0.2 rounded bg-zinc-950 text-[#ff4d00]">8A</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight leading-[1.15]">
              Zarządzanie rotacją dróg, sektorami i zespołem route setterów.
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
              System operacyjny dla centrów wspinaczkowych i ścianek boulderingowych: od monitoringu starzenia dróg po etykiety QR i consensus wycen.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="bg-white rounded-xl p-3.5 border border-zinc-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-white inline-block"></span>
                <span className="w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white inline-block"></span>
                <span className="w-4 h-4 rounded-full bg-amber-400 ring-2 ring-white inline-block"></span>
                <span className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white inline-block"></span>
                <span className="w-4 h-4 rounded-full bg-purple-600 ring-2 ring-white inline-block"></span>
              </div>
              <span className="text-xs font-semibold text-zinc-800">Kody Kolorów & Sektory</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Footprints className="w-3 h-3 text-zinc-400" /> 142 Drogi
              </span>
              <span>•</span>
              <span>6 Sektorów</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">98.4% Świeżość</span>
            </div>
          </div>

          {/* Core Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-[#ff4d00] border border-zinc-200">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-950">Harmonogram & Rotacja</h3>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Śledzenie wieku dróg (alerty 45-dniowe), planowanie sesji resetu i archiwizacja logów.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-blue-600 border border-zinc-200">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-950">Etykiety z Kodami QR</h3>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Generowanie gotowych do druku tagów na ściankę z kodem rejestracji przejść i feedbacku.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-emerald-600 border border-zinc-200">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-950">Zarządzanie Setterami</h3>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Kolejka zadań Kanban, bilans trudności i konwersja zadań w gotowe drogi na ścianie.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-purple-600 border border-zinc-200">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-950">Telemetria & Konsensus</h3>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Wykresy przejść, consensus wyceny wspinaczy vs stopień oficjalny oraz oceny gwiazdkowe.
              </p>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-bold">
              Konta demonstracyjne (Błyskawiczne logowanie):
            </p>
            <div className="flex flex-wrap gap-2">
               

               

              
            </div>
          </div>

        </div>

        {/* Right Column: Clean White Authentication Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-7 shadow-xs relative">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-mono font-bold text-zinc-600 mb-1.5">
                  <Tag className="w-3 h-3 text-[#ff4d00]" />
                  <span>{isRegisterMode ? 'REJESTRACJA OBIEKTU' : 'AUTORYZACJA'}</span>
                </div>
                <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                  {isRegisterMode ? 'Zarejestruj ściankę' : 'Panel Logowania'}
                </h2>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-200 shrink-0">
                {isRegisterMode ? <UserPlus className="w-4 h-4 text-[#ff4d00]" /> : <LogIn className="w-4 h-4 text-[#ff4d00]" />}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Imię i Nazwisko Zarządcy
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="np. Jan Kowalski"
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#ff4d00] focus:bg-white text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-lg outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Rola w obiekcie
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Gym Manager', 'Head Setter', 'Route Setter'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer text-center ${
                            role === r
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950'
                          }`}
                        >
                          {r === 'Gym Manager' ? 'Manager' : r === 'Head Setter' ? 'Head Setter' : 'Setter'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Nazwa Obiektu Wspinaczkowego
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="np. VertiGym Wspinaczka"
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#ff4d00] focus:bg-white text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-lg outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Adres E-mail
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zarzadca@vertigym.pl"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#ff4d00] focus:bg-white text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-lg outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Hasło
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#ff4d00] focus:bg-white text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-lg outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#ff4d00] hover:bg-[#e04400] text-white py-2.5 px-3.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
              >
                <span>{isRegisterMode ? 'Zarejestruj obiekt' : 'Zaloguj się do panelu'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="mt-5 pt-4 border-t border-zinc-100 text-center">
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
              >
                {isRegisterMode ? (
                  <span>Masz już konto? <strong className="text-[#ff4d00] underline">Zaloguj się</strong></span>
                ) : (
                  <span>Nowa ścianka? <strong className="text-[#ff4d00] underline">Zarejestruj obiekt</strong></span>
                )}
              </button>
            </div>

            {/* Security Callout */}
            <div className="mt-3.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-zinc-500">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>TLS ENCRYPTED & DJANGO REST API AUTH</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white/80 py-4 text-center text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#ff4d00] font-bold">▲</span>
            <p className="text-[11px] font-mono">VERTI GYM OS © 2026. Route Rotation & Setting Engine.</p>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[10px] text-zinc-400">
            <span>Django REST Framework</span>
            <span>•</span>
            <span>React + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
