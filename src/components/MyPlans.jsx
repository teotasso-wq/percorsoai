import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { suggerisciProssimoPiano } from '../lib/aiClient';

export default function MyPlans({ onOpen, onNewPlan }) {
  const [piani, setPiani] = useState(null);
  const [errore, setErrore] = useState(null);
  const [ricerca, setRicerca] = useState('');
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);
  const [cancellando, setCancellando] = useState(false);
  const [suggerimento, setSuggerimento] = useState(null);

  useEffect(() => {
    caricaPiani();
  }, []);

  const caricaPiani = () => {
    supabase
      .from('piani')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setErrore(error.message);
        else setPiani(data);
      });
  };

  const daRiprendere = piani?.find((p) => p.status !== 'completato');
  const completati = piani?.filter((p) => p.status === 'completato') || [];

  useEffect(() => {
    if (completati.length > 0 && !suggerimento) {
      const lista = completati.map((p) => p.form_data).filter(Boolean);
      suggerisciProssimoPiano(lista)
        .then(setSuggerimento)
        .catch(() => {}); // suggerimento facoltativo, nessun errore mostrato
    }
  }, [completati.length]);

  const completatiFiltrati = ricerca
    ? completati.filter((p) => {
        const testo = `${p.form_data?.ambito || ''} ${p.form_data?.obiettivo || ''}`.toLowerCase();
        return testo.includes(ricerca.toLowerCase());
      })
    : completati;

  const eliminaTuttiIDati = async () => {
    setCancellando(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('piani').delete().eq('user_id', userId);
    await supabase.from('profili').delete().eq('user_id', userId);
    await supabase.auth.signOut();
  };

  // Statistiche semplici calcolate da quello che abbiamo già
  const totale = piani?.length || 0;
  const numCompletati = completati.length;
  const tassoCompletamento = totale > 0 ? Math.round((numCompletati / totale) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-navy">I tuoi piani</h1>
        <button className="btn-primary" onClick={() => onNewPlan()}>+ Nuovo piano</button>
      </div>

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          Non riesco a caricare i piani salvati: {errore}
        </div>
      )}

      {totale > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatBox numero={totale} etichetta="Piani totali" />
          <StatBox numero={numCompletati} etichetta="Completati" />
          <StatBox numero={`${tassoCompletamento}%`} etichetta="Tasso completamento" />
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

      {suggerimento && suggerimento.ambito && (
        <div className="bg-dedotto/10 border border-dedotto/30 rounded-2xl p-6 mb-8">
          <p className="text-xs uppercase tracking-wide text-navy/60 mb-1">Potrebbe interessarti</p>
          <h3 className="font-display text-xl text-navy mb-1">{suggerimento.ambito}</h3>
          <p className="text-sm text-ink/70 mb-3">{suggerimento.motivazione}</p>
          <button
            className="btn-secondary text-sm"
            onClick={() => onNewPlan({ ambito: suggerimento.ambito, obiettivo: suggerimento.obiettivo })}
          >
            Crea questo piano
          </button>
        </div>
      )}

      {totale === 0 && (
        <p className="text-ink/60">Non hai ancora nessun piano salvato. Creane uno nuovo per iniziare.</p>
      )}

      {completati.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy/60">Piani completati</h2>
          </div>
          <input
            className="input mb-4"
            placeholder="Cerca tra i tuoi piani..."
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
          <div className="space-y-3">
            {completatiFiltrati.map((p) => {
              const punteggio = calcolaPunteggioFiducia(p.audit_data);
              return (
                <button
                  key={p.id}
                  onClick={() => onOpen(p)}
                  className="w-full text-left bg-white border border-navy/15 rounded-2xl p-5 hover:border-navy transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl text-navy mb-1">
                        {p.form_data?.ambito || 'Piano senza titolo'}
                      </h3>
                      <p className="text-sm text-ink/60 mb-2">{p.form_data?.obiettivo}</p>
                      <div className="flex items-center gap-3 text-xs text-navy/50">
                        <span>{new Date(p.updated_at || p.created_at).toLocaleDateString('it-IT')}</span>
                        {p.audit_data?.verdetto && <span>· {p.audit_data.verdetto}</span>}
                      </div>
                    </div>
                    {punteggio !== null && (
                      <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        punteggio >= 85 ? 'bg-verificato/10 text-verificato' : punteggio >= 60 ? 'bg-dedotto/10 text-dedotto' : 'bg-nonTrovata/10 text-nonTrovata'
                      }`}>
                        {punteggio}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {completatiFiltrati.length === 0 && (
              <p className="text-sm text-ink/50">Nessun piano trovato per "{ricerca}".</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-16 pt-6 border-t border-navy/10">
        {!confermaCancellazione ? (
          <button
            className="text-sm text-nonTrovata underline"
            onClick={() => setConfermaCancellazione(true)}
          >
            Cancella tutti i miei dati
          </button>
        ) : (
          <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4">
            <p className="text-sm text-navy mb-3">
              Questo cancella per sempre tutti i tuoi piani salvati e la tua streak. Non si può annullare. Sei sicuro?
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary text-sm" onClick={() => setConfermaCancellazione(false)}>
                Annulla
              </button>
              <button
                className="text-sm bg-nonTrovata text-white px-4 py-2 rounded-xl font-semibold"
                onClick={eliminaTuttiIDati}
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

function StatBox({ numero, etichetta }) {
  return (
    <div className="bg-white border border-navy/15 rounded-xl p-4 text-center">
      <p className="font-display text-2xl text-navy">{numero}</p>
      <p className="text-xs text-ink/50 mt-1">{etichetta}</p>
    </div>
  );
}

// Punteggio di fiducia = media dei KPI dell'audit, così si vede a
// colpo d'occhio quali piani sono più solidi, senza dover riaprire ognuno.
function calcolaPunteggioFiducia(auditData) {
  if (!auditData?.kpi) return null;
  const valori = Object.values(auditData.kpi);
  if (valori.length === 0) return null;
  const somma = valori.reduce((acc, v) => acc + v, 0);
  return Math.round(somma / valori.length);
}
