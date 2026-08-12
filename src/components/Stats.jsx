import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Stats({ onClose }) {
  const [piani, setPiani] = useState(null);

  useEffect(() => {
    supabase
      .from('piani')
      .select('*')
      .then(({ data }) => setPiani(data || []));
  }, []);

  if (!piani) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-navy/60 text-sm">Sto caricando le statistiche...</p>
      </div>
    );
  }

  const totale = piani.length;
  const completati = piani.filter((p) => p.status === 'completato').length;
  const inCorso = totale - completati;
  const tasso = totale > 0 ? Math.round((completati / totale) * 100) : 0;

  const verdetti = { APPROVATO: 0, 'APPROVATO CON LIMITI': 0, 'DA REVISIONARE': 0 };
  piani.forEach((p) => {
    const v = p.audit_data?.verdetto;
    if (v && verdetti[v] !== undefined) verdetti[v] += 1;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-navy">Le tue statistiche</h1>
        <button className="btn-secondary" onClick={onClose}>← Torna ai piani</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard numero={totale} etichetta="Piani totali" />
        <StatCard numero={completati} etichetta="Completati" />
        <StatCard numero={inCorso} etichetta="In corso" />
        <StatCard numero={`${tasso}%`} etichetta="Tasso completamento" />
      </div>

      {completati > 0 && (
        <div className="bg-white border border-navy/15 rounded-2xl p-6">
          <h2 className="font-display text-xl text-navy mb-4">Verdetti degli audit</h2>
          <div className="space-y-3">
            {Object.entries(verdetti).map(([nome, valore]) => (
              <div key={nome} className="flex justify-between text-sm">
                <span className="text-ink">{nome}</span>
                <span className="font-semibold text-navy">{valore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totale === 0 && (
        <p className="text-ink/60">Non hai ancora dati sufficienti — crea il tuo primo piano per iniziare a vedere le statistiche.</p>
      )}
    </div>
  );
}

function StatCard({ numero, etichetta }) {
  return (
    <div className="bg-white border border-navy/15 rounded-2xl p-5 text-center">
      <p className="font-display text-3xl text-navy mb-1">{numero}</p>
      <p className="text-xs text-ink/60">{etichetta}</p>
    </div>
  );
}
