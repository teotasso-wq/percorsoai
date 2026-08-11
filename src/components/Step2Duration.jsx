import { useEffect, useState } from 'react';
import { generaDurate } from '../lib/aiClient';

export default function Step2Duration({ selected, formData, onNext, onBack }) {
  const [durations, setDurations] = useState(null);
  const [errore, setErrore] = useState(null);
  const [caricando, setCaricando] = useState(true);

  useEffect(() => {
    setCaricando(true);
    setErrore(null);
    generaDurate(formData)
      .then((data) => setDurations(data.durations || []))
      .catch((e) => setErrore(e.message))
      .finally(() => setCaricando(false));
  }, [formData]);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">Quanto tempo vuoi dedicarci?</h1>
      <p className="text-ink/60 mb-8">
        Tre proposte in base a quello che ci hai detto. Scegline una — potrai sempre rigenerare il piano.
      </p>

      {caricando && (
        <div className="text-navy/60 text-sm py-8">Sto calcolando le proposte di durata...</div>
      )}

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          Non sono riuscito a generare le proposte: {errore}
        </div>
      )}

      {durations && (
        <div className="grid md:grid-cols-3 gap-4">
          {durations.map((d) => (
            <button
              key={d.id}
              onClick={() => onNext(d)}
              className={`text-left p-6 rounded-2xl border-2 transition-all hover:border-navy hover:shadow-md ${
                selected?.id === d.id ? 'border-navy bg-navy/5' : 'border-navy/15 bg-white'
              }`}
            >
              <div className="font-display text-2xl text-navy mb-1">{d.weeks} sett.</div>
              <div className="font-semibold text-sm text-navy/80 mb-2">{d.label}</div>
              <p className="text-sm text-ink/60">{d.note}</p>
            </button>
          ))}
        </div>
      )}

      <button className="btn-secondary mt-10" onClick={onBack}>
        ← Indietro
      </button>
    </div>
  );
}
