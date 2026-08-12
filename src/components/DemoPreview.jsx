import { DEMO_PHASES, DEMO_SOURCES, DEMO_AUDIT } from '../data/demoPlan';
import Badge from './Badge';

export default function DemoPreview({ onClose }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold text-sm">
              P
            </div>
            <span className="font-display text-xl text-navy">PercorsoAI</span>
          </div>
          <button className="btn-secondary text-sm" onClick={onClose}>Chiudi anteprima</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 text-sm text-navy mb-8">
          Questo è un esempio dimostrativo con dati finti, per farti vedere come funziona l'app prima di crearne uno tuo. Il piano vero viene generato con ricerca web reale.
        </div>

        <h1 className="font-display text-3xl text-navy mb-2">Esempio: Progettista meccanico</h1>
        <p className="text-ink/60 mb-8">Così appare un percorso completo, con fasi, fonti e audit finale.</p>

        <div className="space-y-4 mb-10">
          {DEMO_PHASES.map((phase) => (
            <div key={phase.id} className="border border-navy/15 rounded-2xl bg-white p-6">
              <h3 className="font-display text-xl text-navy mb-1">{phase.titolo}</h3>
              <div className="flex items-center gap-3 text-sm text-ink/60 mb-3">
                <span>{phase.durata}</span>
                <Badge type={phase.tag} />
              </div>
              <p className="text-sm text-ink">{phase.obiettivo}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-10">
          <h2 className="font-display text-2xl text-navy mb-4">Fonti</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge type="verificato" />
            <Badge type="dedotto" />
            <Badge type="assunto" />
          </div>
          {DEMO_SOURCES.map((s, i) => (
            <p key={i} className="text-sm text-ink/70 py-1">{s.title} — {s.tipo}</p>
          ))}
        </div>

        <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-10">
          <h2 className="font-display text-2xl text-navy mb-3">Audit finale</h2>
          <p className="text-sm text-ink/70 mb-2">Verdetto: <strong className="text-navy">{DEMO_AUDIT.verdetto}</strong></p>
          <p className="text-sm text-ink/70">Rischio allucinazioni: {DEMO_AUDIT.rischio}</p>
        </div>

        <button className="btn-primary w-full" onClick={onClose}>
          Crea il tuo piano vero →
        </button>
      </main>
    </div>
  );
}
