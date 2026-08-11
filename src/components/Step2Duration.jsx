import { DEMO_DURATIONS } from '../data/demoPlan';

export default function Step2Duration({ selected, onNext, onBack }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">Quanto tempo vuoi dedicarci?</h1>
      <p className="text-ink/60 mb-8">
        Tre proposte in base a quello che ci hai detto. Scegline una — potrai sempre rigenerare il piano.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {DEMO_DURATIONS.map((d) => (
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

      <button className="btn-secondary mt-10" onClick={onBack}>
        ← Indietro
      </button>
    </div>
  );
}
