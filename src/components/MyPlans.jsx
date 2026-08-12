import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyPlans({ onOpen, onNewPlan }) {
  const [piani, setPiani] = useState(null);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    supabase
      .from('piani')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setErrore(error.message);
        else setPiani(data);
      });
  }, []);

  const daRiprendere = piani?.find((p) => p.status !== 'completato');
  const completati = piani?.filter((p) => p.status === 'completato') || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-navy">I tuoi piani</h1>
        <button className="btn-primary" onClick={onNewPlan}>+ Nuovo piano</button>
      </div>

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          Non riesco a caricare i piani salvati: {errore}
        </div>
      )}

      {daRiprendere && (
        <button
          onClick={() => onOpen(daRiprendere)}
          className="w-full text-left bg-navy text-paper rounded-2xl p-6 mb-8 hover:bg-navyDark transition-colors"
        >
          <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Riprendi da dove eri</p>
          <h3 className="font-display text-xl mb-1">
            {daRiprendere.form_data?.ambito || 'Piano senza titolo'}
          </h3>
          <p className="text-sm opacity-80">{daRiprendere.form_data?.obiettivo}</p>
        </button>
      )}

      {piani && piani.length === 0 && (
        <p className="text-ink/60">Non hai ancora nessun piano salvato. Creane uno nuovo per iniziare.</p>
      )}

      {completati.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy/60">Piani completati</h2>
          {completati.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="w-full text-left bg-white border border-navy/15 rounded-2xl p-5 hover:border-navy transition-colors"
            >
              <h3 className="font-display text-xl text-navy mb-1">
                {p.form_data?.ambito || 'Piano senza titolo'}
              </h3>
              <p className="text-sm text-ink/60 mb-2">{p.form_data?.obiettivo}</p>
              <div className="flex items-center gap-3 text-xs text-navy/50">
                <span>{new Date(p.updated_at || p.created_at).toLocaleDateString('it-IT')}</span>
                {p.audit_data?.verdetto && <span>· {p.audit_data.verdetto}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
