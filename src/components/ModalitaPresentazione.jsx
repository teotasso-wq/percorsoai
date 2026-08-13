import { useState } from 'react';

export default function ModalitaPresentazione({ planData, ambito, onClose }) {
  const [indice, setIndice] = useState(0);
  const fase = planData.phases[indice];
  const ultimo = indice === planData.phases.length - 1;

  return (
    <div className="fixed inset-0 bg-navy text-paper flex flex-col z-50">
      <div className="flex justify-between items-center p-6">
        <span className="text-sm opacity-60">{ambito}</span>
        <button className="text-sm underline opacity-70" onClick={onClose}>Esci dalla presentazione</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
        <p className="text-sm uppercase tracking-widest opacity-50 mb-4">
          Fase {indice + 1} di {planData.phases.length}
        </p>
        <h1 className="font-display text-4xl md:text-6xl mb-8">{fase.titolo}</h1>
        <p className="text-xl md:text-2xl opacity-80 max-w-2xl">{fase.obiettivo}</p>
        <p className="text-sm opacity-50 mt-8">{fase.durata}</p>
      </div>

      <div className="flex justify-center gap-4 p-8">
        <button
          className="px-6 py-3 rounded-xl border border-paper/30 disabled:opacity-30"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
        >
          ← Precedente
        </button>
        <button
          className="px-6 py-3 rounded-xl bg-paper text-navy font-semibold disabled:opacity-30"
          onClick={() => setIndice((i) => Math.min(planData.phases.length - 1, i + 1))}
          disabled={ultimo}
        >
          Successiva →
        </button>
      </div>
    </div>
  );
}
