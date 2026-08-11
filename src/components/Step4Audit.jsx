import { DEMO_AUDIT } from '../data/demoPlan';

const RISCHIO_COLORE = {
  Basso: 'bg-verificato/10 text-verificato',
  Medio: 'bg-dedotto/10 text-dedotto',
  Alto: 'bg-nonTrovata/10 text-nonTrovata',
};

export default function Step4Audit({ onBack }) {
  const a = DEMO_AUDIT;

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-8">Audit del piano</h1>

      <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-6">
        <h2 className="font-display text-2xl text-navy mb-4">Simulazione del risultato</h2>
        <div className="bg-verificato/10 border border-verificato/30 rounded-xl p-4">
          <p className="font-semibold text-navy mb-1">
            Il percorso porta al criterio di successo? {a.simulazione}
          </p>
          <p className="text-sm text-ink/70">{a.spiegazione}</p>
        </div>
      </div>

      <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-6">
        <h2 className="font-display text-2xl text-navy mb-5">KPI del piano</h2>
        <div className="space-y-5">
          {Object.entries(a.kpi).map(([nome, valore]) => (
            <div key={nome}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-ink">{nome}</span>
                <span className="text-navy/60">{valore}/100</span>
              </div>
              <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                <div className="h-full bg-navy rounded-full" style={{ width: `${valore}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-navy/15 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-navy/60 mb-3">Rischio allucinazioni</h3>
          <span className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm ${RISCHIO_COLORE[a.rischio]}`}>
            {a.rischio}
          </span>
        </div>
        <div className="bg-white border border-navy/15 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-navy/60 mb-3">Verdetto finale</h3>
          <p className="font-display text-2xl text-navy">{a.verdetto}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <button className="btn-secondary">Copia prompt NotebookLM (tutto)</button>
        <button className="btn-primary">Esporta PDF</button>
      </div>

      <button className="btn-secondary" onClick={onBack}>← Indietro</button>
    </div>
  );
}
