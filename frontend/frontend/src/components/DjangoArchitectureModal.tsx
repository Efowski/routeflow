import React, { useState } from 'react';
import { DJANGO_SAAS_APPS } from '../data/djangoBlueprint';
import { Code2, Server, Database, Layers, Copy, Check, Terminal, FolderTree, Cpu, CheckCircle2, Download, PackageCheck } from 'lucide-react';
import { downloadBackendZip, downloadFrontendZip } from '../utils/zipGenerator';

export const DjangoArchitectureModal: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>('gyms');
  const [activeFileTab, setActiveFileTab] = useState<'models' | 'serializers' | 'views' | 'urls'>('models');
  const [copied, setCopied] = useState(false);

  const currentApp = DJANGO_SAAS_APPS.find((app) => app.id === selectedAppId) || DJANGO_SAAS_APPS[0];

  const getCodeForTab = () => {
    switch (activeFileTab) {
      case 'models':
        return currentApp.models;
      case 'serializers':
        return currentApp.serializers;
      case 'views':
        return currentApp.views;
      case 'urls':
        return currentApp.urls;
      default:
        return currentApp.models;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeForTab());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Download Packages Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff4d00]">
              PRODUCTION ARTIFACTS
            </span>
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">Pobierz Gotowe Paczki Projektu (ZIP)</h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Archiwa zawierają kompletny kod backendu Django REST API oraz frontendu React do uruchomienia lokalnego (`localhost:8000`).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={() => downloadBackendZip()}
            className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pobierz Django Backend (.zip)</span>
          </button>

          <button
            onClick={() => downloadFrontendZip()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3.5 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pobierz React Frontend (.zip)</span>
          </button>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              ARCHITECTURE SPECIFICATION
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Django REST Framework Specyfikacja (.py)</span>
          </h2>
        </div>

        <button
          onClick={handleCopy}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Skopiowano!' : 'Kopiuj Kod'}</span>
        </button>
      </div>

      {/* Overview of 4 SaaS Apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DJANGO_SAAS_APPS.map((app) => {
          const isSelected = app.id === selectedAppId;
          return (
            <button
              key={app.id}
              onClick={() => {
                setSelectedAppId(app.id);
                setActiveFileTab('models');
              }}
              className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white border-zinc-200/80 hover:border-zinc-300 text-zinc-900'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-zinc-800 text-[#ff4d00]' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}>
                    {app.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4d00]" />}
                </div>
                <h3 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-950'}`}>{app.name}</h3>
                <p className={`text-[10px] font-mono ${isSelected ? 'text-[#ff4d00]' : 'text-[#ff4d00] font-semibold'}`}>{app.folderName}</p>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{app.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Directory Structure & Active App Inspector */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-2xs">
        {/* App Title & File Sub-Tabs */}
        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-[#ff4d00]" />
            <span className="text-xs font-mono font-bold text-zinc-950">{currentApp.folderName}/</span>
            <span className="text-xs text-zinc-500 font-medium">({currentApp.name})</span>
          </div>

          {/* File Selector Tabs */}
          <div className="flex items-center space-x-1 bg-zinc-200/60 p-0.5 rounded-lg border border-zinc-300/60">
            {(['models', 'serializers', 'views', 'urls'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFileTab(tab)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                  activeFileTab === tab
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab}.py
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Display */}
        <div className="p-4 bg-zinc-950 text-zinc-100 overflow-x-auto text-xs font-mono">
          <pre className="leading-relaxed">
            <code>{getCodeForTab()}</code>
          </pre>
        </div>
      </div>

      {/* Global SaaS Project Settings Integration */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-2.5 shadow-2xs">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-mono flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#ff4d00]" />
          <span>Konfiguracja Globalna Django (`config/settings.py`):</span>
        </h3>

        <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
          <p className="text-zinc-500"># config/settings.py</p>
          <p className="text-amber-400">INSTALLED_APPS = [</p>
          <p className="pl-4 text-zinc-500"># Django Core Apps</p>
          <p className="pl-4 text-zinc-400">'django.contrib.admin', 'django.contrib.auth', ...</p>
          <p className="pl-4 text-zinc-500"># Third-party Extensions</p>
          <p className="pl-4 text-cyan-400">'rest_framework', 'corsheaders',</p>
          <p className="pl-4 text-zinc-500"># 4 Verti Gym OS Micro-Apps</p>
          <p className="pl-4 text-emerald-400">'apps.gyms',       # Obiekt & Sektory</p>
          <p className="pl-4 text-cyan-400">'apps.routes',     # Katalog Dróg & QR</p>
          <p className="pl-4 text-amber-400">'apps.setting',    # Planer & Zadania</p>
          <p className="pl-4 text-purple-400">'apps.analytics',  # Telemetria & Przejścia</p>
          <p className="text-amber-400">]</p>
        </div>
      </div>
    </div>
  );
};
