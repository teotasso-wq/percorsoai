import { useEffect } from 'react';

export default function PrintPortfolio({ formData, planData, onClose }) {
  useEffect(() => {
    document.title = `Portfolio - ${formData.ambito}`;
  }, [formData.ambito]);

  return (
    <div className="min-h-screen bg-white text-ink px-8 py-10 max-w-3xl mx-auto print:px-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button className="btn-secondary" onClick={onClose}>← Torna al piano</button>
        <button className="btn-primary" onClick={() => window.print()}>Scarica / Stampa PDF</button>
      </div>

      <div className="text-center mb-10 pb-6 border-b-2 border-navy">
        <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">PercorsoAI — Portfolio tecnico</p>
        <h1 className="font-display text-3xl text-navy mb-2">{formData.ambito}</h1>
        <p className="text-ink/60">Output pratici prodotti durante il percorso</p>
      </div>

      <div className="space-y-8">
        {planData?.phases?.map((phase, i) => (
          <div key={phase.id} className="break-inside-avoid">
            <p className="text-xs font-bold uppercase text-navy/50 mb-1">Output {i + 1} — {phase.titolo}</p>
            <div className="border border-navy/15 rounded-xl p-5">
              <p className="text-sm">{phase.portfolio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
