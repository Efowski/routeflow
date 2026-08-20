import React, { useState, useEffect } from 'react';
import { RouteItem } from '../types';
import QRCode from 'qrcode';
import { QrCode, Printer, Smartphone, Star, CheckCircle2, Mountain, ExternalLink, Download } from 'lucide-react';

interface QRCodeManagerProps {
  routes: RouteItem[];
  selectedRouteForQR: RouteItem | null;
  onClearSelection: () => void;
}

export const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  routes,
  selectedRouteForQR,
  onClearSelection,
}) => {
  const [activeRouteId, setActiveRouteId] = useState<string>(
    selectedRouteForQR ? selectedRouteForQR.id : routes[0]?.id || ''
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [climberRating, setClimberRating] = useState(5);
  const [climberComment, setClimberComment] = useState('');
  const [ascentLoggedSuccess, setAscentLoggedSuccess] = useState(false);

  const currentRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  useEffect(() => {
    if (selectedRouteForQR) {
      setActiveRouteId(selectedRouteForQR.id);
    }
  }, [selectedRouteForQR]);

  useEffect(() => {
    if (currentRoute) {
      const targetUrl = `https://vertigym.app/r/${currentRoute.id}`;
      QRCode.toDataURL(targetUrl, { width: 300, margin: 2, color: { dark: '#09090b', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [currentRoute]);

  const handleSimulateAscent = (e: React.FormEvent) => {
    e.preventDefault();
    setAscentLoggedSuccess(true);
    setTimeout(() => {
      setAscentLoggedSuccess(false);
      setIsSimulatorOpen(false);
      setClimberComment('');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              TAG GENERATOR & SCAN PROTOCOL
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mt-0.5 flex items-center space-x-2">
            <span>Generator Tagów QR & Podgląd Mobilny</span>
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200 px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#ff4d00]" />
            <span>Widok Wspinacza</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#ff4d00] hover:bg-[#e04400] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drukuj Etykietę</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Route selector */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Wybierz Drogę / Boulder:
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">{routes.length} w bazie</span>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {routes.map((r) => {
              const isSelected = r.id === activeRouteId;
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRouteId(r.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50/70 border-zinc-200/70 hover:border-zinc-300 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <span
                      className="w-3 h-3 rounded-full border border-zinc-300 shrink-0"
                      style={{ backgroundColor: r.holdColorHex }}
                    />
                    <div className="truncate min-w-0">
                      <strong className={`text-xs block truncate font-bold ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                        {r.name}
                      </strong>
                      <span className={`text-[10px] block truncate font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {r.sectorName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    isSelected ? 'bg-zinc-800 text-[#ff4d00] border border-zinc-700' : 'bg-zinc-200/80 text-zinc-900'
                  }`}>
                    {r.grade}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Printable Tag Preview */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-xl p-5 flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider self-start">
            Fizyczny Tag na Ścianę (Podgląd wydruku):
          </h3>

          {/* Tag Card (Mimics real gym card) */}
          {currentRoute && (
            <div className="bg-white text-zinc-950 rounded-xl p-5 shadow-sm max-w-xs w-full border-2 border-zinc-950 relative space-y-3.5 print:m-0 print:border-2">
              {/* Gym Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-[#ff4d00] text-white rounded flex items-center justify-center font-black text-xs">
                    V
                  </div>
                  <div>
                    <strong className="text-xs font-black tracking-tight uppercase block leading-none text-zinc-950">
                      VERTI GYM OS
                    </strong>
                    <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">
                      OFFICIAL WALL TAG
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-zinc-400 font-mono uppercase block">Sektor</span>
                  <strong className="text-[11px] font-bold text-zinc-950 block">{currentRoute.sectorName.split('-')[0]}</strong>
                </div>
              </div>

              {/* Title & Grade Main Banner */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-zinc-950 leading-tight">{currentRoute.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-zinc-400"
                      style={{ backgroundColor: currentRoute.holdColorHex }}
                    />
                    <span className="text-[11px] font-semibold text-zinc-600 capitalize">
                      {currentRoute.holdColor}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950 text-white px-3 py-1 rounded-lg text-center border border-zinc-800">
                  <span className="text-lg font-black block leading-none font-mono">{currentRoute.grade}</span>
                  {currentRoute.vGrade && (
                    <span className="text-[9px] text-amber-400 font-mono font-bold block mt-0.5">{currentRoute.vGrade}</span>
                  )}
                </div>
              </div>

              {/* QR Code & Meta info */}
              <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/70">
                <div className="space-y-0.5 text-[10px] text-zinc-700 font-mono">
                  <p><strong>Setter:</strong> {currentRoute.setterName}</p>
                  <p><strong>Data:</strong> {currentRoute.dateSet}</p>
                  <p className="text-[8px] text-zinc-400 mt-1">Zeskanuj aparatem, aby dodać przejście!</p>
                </div>

                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 rounded border border-zinc-300 bg-white p-0.5" />
                )}
              </div>

              <div className="text-[8px] text-center font-mono text-zinc-400 pt-0.5">
                ID: {currentRoute.id}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal */}
      {isSimulatorOpen && currentRoute && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative space-y-3.5">
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                📱 Widok Aplikacji Wspinacza (PWA)
              </span>
              <h3 className="text-base font-bold text-zinc-950 pt-1">{currentRoute.name}</h3>
              <span className="text-[#ff4d00] font-mono font-black text-lg bg-zinc-100 px-3 py-0.5 rounded-lg border border-zinc-200 inline-block">
                {currentRoute.grade}
              </span>
            </div>

            {ascentLoggedSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-1.5 text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-zinc-900">Przejście Zapisane!</h4>
                <p className="text-[11px] text-zinc-600">Dziękujemy za przesłanie oceny i konsensusu trudności.</p>
              </div>
            ) : (
              <form onSubmit={handleSimulateAscent} className="space-y-3 text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 space-y-1">
                  <label className="block text-zinc-700 font-semibold text-[11px]">Odczucie Wyceny:</label>
                  <select className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-zinc-900 text-xs font-bold focus:outline-none focus:border-[#ff4d00]">
                    <option value={currentRoute.grade}>Wycena w punkt ({currentRoute.grade})</option>
                    <option value="soft">Za łatwa (Soft / Łagodne)</option>
                    <option value="hard">Za trudna (Hard / Sztywne)</option>
                  </select>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 space-y-1">
                  <label className="block text-zinc-700 font-semibold text-[11px]">Ocena boulderu:</label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setClimberRating(star)}
                        className="focus:outline-none cursor-pointer p-0.5"
                      >
                        <Star className={`w-5 h-5 ${star <= climberRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1 text-[11px]">Komentarz wspinacza:</label>
                  <textarea
                    rows={2}
                    placeholder="np. Świetne techniczne ruchy po krawądkach!"
                    value={climberComment}
                    onChange={(e) => setClimberComment(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 text-xs focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ff4d00] hover:bg-[#e04400] text-white font-bold py-2 rounded-lg shadow-xs transition cursor-pointer"
                >
                  Zapisz Przejście (Send)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
