import { useState } from 'react';

export default function ChecklistPrimiPassi({ onNewPlan, onApriGuida }) {
  const [chiusaManualmente, setChiusaManualmente] = useState(false);

  const haGeneratoPiano = localStorage.getItem('percorsoai_ha_generato_piano') === '1';
  const haApertoGuida = localStorage.getItem('percorsoai_ha_aperto_guida') === '1';

  if ((haGeneratoPiano && haApertoGuida) || chiusaManualmente) return null;

  return (
    <div className="bg-white border border-navy/15 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-navy">Primi passi</h3>
        <button className="text-xs text-navy/40" onClick={() => setChiusaManualmente(true)}>
          Nascondi
        </button>
      </div>
      <div className="space-y-2">
        <RigaChecklist
          fatto={haGeneratoPiano}
          testo="Genera il tuo primo piano vero"
          azione={!haGeneratoPiano ? onNewPlan : null}
        />
        <RigaChecklist
          fatto={haApertoGuida}
          testo="Dai un'occhiata alla Guida"
          azione={!haApertoGuida ? onApriGuida : null}
        />
      </div>
    </div>
  );
}

function RigaChecklist({ fatto, testo, azione }) {
  return (
    <button
      className="w-full flex items-center gap-3 text-left disabled:cursor-default"
      onClick={azione || undefined}
      disabled={!azione}
    >
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        fatto ? 'bg-verificato border-verificato text-white' : 'border-navy/25'
      }`}>
        {fatto && '✓'}
      </span>
      <span className={`text-sm ${fatto ? 'text-ink/40 line-through' : 'text-ink'}`}>{testo}</span>
    </button>
  );
}
