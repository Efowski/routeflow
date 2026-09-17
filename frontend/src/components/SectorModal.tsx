import React, { useState } from 'react';
import { Mountain } from 'lucide-react';

interface SectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSector: (newSectorData: {
    name: string;
    type: 'bouldering' | 'rope_wall' | 'training';
    maxCapacity: number;
    colorCode: string;
  }) => Promise<void>;
}

export const SectorModal: React.FC<SectorModalProps> = ({
  isOpen,
  onClose,
  onAddSector,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<
    'bouldering' | 'rope_wall' | 'training'
  >('bouldering');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [colorCode, setColorCode] = useState('#ff4d00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || maxCapacity < 1) return;

    try {
      setIsSubmitting(true);

      await onAddSector({
        name: trimmedName,
        type,
        maxCapacity: Number(maxCapacity),
        colorCode,
      });

      setName('');
      setType('bouldering');
      setMaxCapacity(20);
      setColorCode('#ff4d00');

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-4 text-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-800 font-bold p-1"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <Mountain className="w-4 h-4 text-[#ff4d00]" />

            <h3 className="text-base font-bold text-zinc-950">
              Utwórz pierwszy sektor
            </h3>
          </div>

          <p className="text-xs text-zinc-500 mt-1">
            Sektor będzie dostępny od razu podczas planowania sesji.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-700 font-semibold mb-1">
              Nazwa sektora *
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Sektor A"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-semibold mb-1">
              Typ sektora
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as
                    | 'bouldering'
                    | 'rope_wall'
                    | 'training'
                )
              }
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 focus:outline-none focus:border-[#ff4d00]"
            >
              <option value="bouldering">Bouldering</option>
              <option value="rope_wall">Ściana linowa</option>
              <option value="training">Treningowy</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Pojemność
              </label>

              <input
                type="number"
                min="1"
                required
                value={maxCapacity}
                onChange={(e) =>
                  setMaxCapacity(Number(e.target.value))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-900 font-mono font-bold focus:outline-none focus:border-[#ff4d00]"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Kolor
              </label>

              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-full h-[34px] bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition"
            >
              Anuluj
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#ff4d00] hover:bg-[#e04400] disabled:opacity-60 text-white font-bold transition shadow-xs"
            >
              {isSubmitting ? 'Tworzenie...' : 'Utwórz sektor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};