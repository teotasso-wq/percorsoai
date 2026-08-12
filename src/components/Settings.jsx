import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Settings({ onClose }) {
  const [primaConferma, setPrimaConferma] = useState(false);
  const [cancellando, setCancellando] = useState(false);
  const [errore, setErrore] = useState(null);

  const cancellaTutto = async () => {
    setCancellando(true);
    setErrore(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: errPiani } = await supabase.from('piani').delete().eq('user_id', user.id);
    const { error: errProfilo } = await supabase.from('profili').delete().eq('user_id', user.id);

    if (errPiani || errProfilo) {
      setErrore((errPiani || errProfilo).message);
      setCancellando(false);
      return;
    }

    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-navy">Impostazioni</h1>
        <button className="btn-secondary" onClick={onClose}>← Torna ai piani</button>
      </div>

      <div className="bg-white border border-nonTrovata/30 rounded-2xl p-6">
        <h2 className="font-display text-xl text-navy mb-2">Cancella tutti i miei dati</h2>
        <p className="text-sm text-ink/70 mb-5">
          Questo elimina in modo permanente tutti i piani salvati e le statistiche.
          Non si può annullare. Dopo la cancellazione verrai disconnesso.
        </p>

        {errore && (
          <p className="text-sm text-nonTrovata mb-4">{errore}</p>
        )}

        {!primaConferma ? (
          <button
            className="text-sm text-nonTrovata underline"
            onClick={() => setPrimaConferma(true)}
          >
            Voglio cancellare tutti i miei dati
          </button>
        ) : (
          <div className="bg-nonTrovata/10 rounded-xl p-4">
            <p className="text-sm text-navy mb-4 font-semibold">
              Sei sicuro? Questa azione è definitiva e cancella ogni piano salvato.
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary text-sm"
                onClick={() => setPrimaConferma(false)}
              >
                Annulla
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-nonTrovata text-white font-semibold text-sm disabled:opacity-50"
                onClick={cancellaTutto}
                disabled={cancellando}
              >
                {cancellando ? 'Cancellazione in corso...' : 'Sì, cancella tutto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
