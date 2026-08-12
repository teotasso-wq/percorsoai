import { useState } from 'react';

const PASSI = [
  {
    titolo: 'Racconta cosa vuoi imparare',
    testo: 'Rispondi a poche domande su ambito, obiettivo e tempo disponibile — bastano 2 minuti.',
  },
  {
    titolo: 'Scegli la durata',
    testo: 'L\'AI propone 3 durate possibili in base a quello che hai scritto. Ne scegli una.',
  },
  {
    titolo: 'Ricevi il piano verificato',
    testo: 'Fasi, competenze e fonti reali trovate con una ricerca web vera — nessuna fonte inventata.',
  },
  {
    titolo: 'Controlla l\'audit finale',
    testo: 'Un giudizio onesto su quanto il piano è solido, prima di iniziare a studiare davvero.',
  },
];

export default function Tutorial({ onClose }) {
  const [indice, setIndice] = useState(0);
  const ultimo = indice === PASSI.length - 1;

  return (
    <div className="fixed inset-0 bg-navy/40 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-navy/50 mb-3">
          Passo {indice + 1} di {PASSI.length}
        </p>
        <h2 className="font-display text-2xl text-navy mb-2">{PASSI[indice].titolo}</h2>
        <p className="text-sm text-ink/70 mb-6">{PASSI[indice].testo}</p>

        <div className="flex gap-2 mb-6">
          {PASSI.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= indice ? 'bg-navy' : 'bg-navy/15'}`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button className="text-sm text-navy/50 underline" onClick={onClose}>
            Salta
          </button>
          <button
            className="btn-primary"
            onClick={() => (ultimo ? onClose() : setIndice(indice + 1))}
          >
            {ultimo ? 'Iniziamo' : 'Avanti'}
          </button>
        </div>
      </div>
    </div>
  );
}
