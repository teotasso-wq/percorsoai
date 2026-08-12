import { useState } from 'react';

export default function ObiettivoSettimanale({ piano, onSalva }) {
  const [modifica, setModifica] = useState(!piano.obiettivo_settimanale);
  const [testo, setTesto] = useState(piano.obiettivo_settimanale || '');
  const [scadenza, setScadenza] = useState(piano.obiettivo_settimanale_scadenza || '');

  const salva = () => {
    const oggi = new Date().toISOString().slice(0, 10);
    onSalva({
      obiettivo_settimanale: testo,
      obiettivo_settimanale_scadenza: scadenza,
      obiettivo_settimanale_impostato_il: oggi,
    });
    setModifica(false);
  };

  const calcolaProgresso = () => {
    if (!piano.obiettivo_settimanale_impostato_il || !piano.obiettivo_settimanale_scadenza) return 0;
    const inizio = new Date(piano.obiettivo_settimanale_impostato_il);
    const fine = new Date(piano.obiettivo_settimanale_scadenza);
    const oggi = new Date();
    const totale = fine - inizio;
    const passato = oggi - inizio;
    if (totale <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((passato / totale) * 100)));
  };

  const giorniRimasti = () => {
    if (!piano.obiettivo_settimanale_scadenza) return null;
    const fine = new Date(piano.obiettivo_settimanale_scadenza);
    const oggi = new Date();
    const diff = Math.ceil((fine - oggi) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (modifica) {
    return (
      <div className="bg-white border border-navy/15 rounded-2xl p-5 mb-8">
        <h3 className="font-display text-lg text-navy mb-3">Obiettivo di questa settimana</h3>
        <input
          className="input mb-3"
          placeholder="Es. Finire la Fase 2"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
        />
        <label className="block text-xs font-semibold text-navy/60 mb-1">Entro quando</label>
        <input
          type="date"
          className="input mb-4"
          value={scadenza}
          onChange={(e) => setScadenza(e.target.value)}
        />
        <button className="btn-primary text-sm" disabled={!testo || !scadenza} onClick={salva}>
          Imposta obiettivo
        </button>
      </div>
    );
  }

  const progresso = calcolaProgresso();
  const rimasti = giorniRimasti();

  return (
    <div className="bg-white border border-navy/15 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-lg text-navy">{piano.obiettivo_settimanale}</h3>
        <button className="text-xs text-navy/50 underline" onClick={() => setModifica(true)}>
          Modifica
        </button>
      </div>
      <p className="text-xs text-ink/50 mb-3">
        {rimasti !== null && rimasti >= 0 ? `${rimasti} ${rimasti === 1 ? 'giorno rimasto' : 'giorni rimasti'}` : 'Scadenza superata'}
      </p>
      <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rimasti !== null && rimasti < 0 ? 'bg-nonTrovata' : 'bg-navy'}`}
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}
