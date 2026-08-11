import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyPlans({ onOpen, onNewPlan }) {
  const [piani, setPiani] = useState(null);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    supabase
      .from('piani')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setErrore(error.message);
        else setPiani(data);
      });
  }, []);

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

      {piani && piani.length === 0 && (
        <p className="text-ink/60">Non hai ancora nessun piano salvato. Creane uno nuovo per iniziare.</p>
      )}

      {piani && piani.length > 0 && (
        <div className="space-y-3">
          {piani.map((p) => (
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
                <span>{new Date(p.created_at).toLocaleDateString('it-IT')}</span>
                {p.audit_data?.verdetto && <span>· {p.audit_data.verdetto}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
