import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { suggerisciProssimoPiano } from '../lib/aiClient';
import { useLingua } from '../lib/LinguaContext';

export default function MyPlans({ onOpen, onNewPlan }) {
  const { t } = useLingua();
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
    if (completati.length === 0) return;
    caricaSuggerimento();
  }, [completati.length]);

  const caricaSuggerimento = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const { data: profilo } = await supabase
      .from('profili')
      .select('suggerimento_json, suggerimento_basato_su')
      .eq('user_id', userId)
      .maybeSingle();

    // Ottimizzazione 3: se il numero di piani completati non è cambiato
    // da quando abbiamo generato l'ultimo suggerimento, usa quello
    // salvato invece di richiamare l'AI ad ogni apertura della home.
    if (profilo?.suggerimento_json && profilo.suggerimento_basato_su === completati.length) {
      setSuggerimento(profilo.suggerimento_json);
      return;
    }

    const lista = completati.map((p) => p.form_data).filter(Boolean);
    try {
      const nuovoSuggerimento = await suggerisciProssimoPiano(lista);
      setSuggerimento(nuovoSuggerimento);
      await supabase
        .from('profili')
        .update({ suggerimento_json: nuovoSuggerimento, suggerimento_basato_su: completati.length })
        .eq('user_id', userId);
    } catch {
      // suggerimento facoltativo, nessun errore mostrato
    }
  };

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

  const totale = piani?.length || 0;
  const numCompletati = completati.length;
  const tassoCompletamento = totale > 0 ? Math.round((numCompletati / totale) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-navy">{t('piani_titolo')}</h1>
        <button className="btn-primary" onClick={() => onNewPlan()}>{t('piani_nuovo')}</button>
      </div>

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          {errore}
        </div>
      )}

      {totale > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatBox numero={totale} etichetta={t('piani_totali')} />
          <StatBox numero={numCompletati} etichetta={t('piani_completati_stat')} />
          <StatBox numero={`${tassoCompletamento}%`} etichetta={t('piani_tasso')} />
        </div>
      )}

      {daRiprendere && (
        <button
          onClick={() => onOpen(daRiprendere)}
          className="w-full text-left bg-navy text-paper rounded-2xl p-6 mb-8 hover:bg-navyDark transition-colors"
        >
          <p className="text-xs uppercase tracking-wide opacity-70 mb-1">{t('piani_riprendi')}</p>
          <h3 className="font-display text-xl mb-1">
            {daRiprendere.form_data?.ambito || 'Piano senza titolo'}
          </h3>
          <p className="text-sm opacity-80">{daRiprendere.form_data?.obiettivo}</p>
        </button>
      )}

      {suggerimento && suggerimento.ambito && (
        <div className="bg-dedotto/10 border border-dedotto/30 rounded-2xl p-6 mb-8">
          <p className="text-xs uppercase tracking-wide text-navy/60 mb-1">{t('piani_suggerimento')}</p>
          <h3 className="font-display text-xl text-navy mb-1">{suggerimento.ambito}</h3>
          <p className="text-sm text-ink/70 mb-3">{suggerimento.motivazione}</p>
          <button
            className="btn-secondary text-sm"
            onClick={() => onNewPlan({ ambito: suggerimento.ambito, obiettivo: suggerimento.obiettivo })}
          >
            {t('piani_crea_suggerito')}
          </button>
        </div>
      )}

      {totale === 0 && (
        <p className="text-ink/60">{t('piani_vuoto')}</p>
      )}

      {completati.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy/60">{t('piani_completati_titolo')}</h2>
          </div>
          <input
            className="input mb-4"
            placeholder={t('piani_cerca')}
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
              <p className="text-sm text-ink/50">{t('piani_nessun_risultato')} "{ricerca}".</p>
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
            {t('piani_cancella_dati')}
          </button>
        ) : (
          <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4">
            <p className="text-sm text-navy mb-3">{t('piani_cancella_conferma')}</p>
            <div className="flex gap-3">
              <button className="btn-secondary text-sm" onClick={() => setConfermaCancellazione(false)}>
                {t('piani_annulla')}
              </button>
              <button
                className="text-sm bg-nonTrovata text-white px-4 py-2 rounded-xl font-semibold"
                onClick={eliminaTuttiIDati}
                disabled={cancellando}
              >
                {cancellando ? t('piani_cancellando') : t('piani_cancella_si')}
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

function calcolaPunteggioFiducia(auditData) {
  if (!auditData?.kpi) return null;
  const valori = Object.values(auditData.kpi);
  if (valori.length === 0) return null;
  const somma = valori.reduce((acc, v) => acc + v, 0);
  return Math.round(somma / valori.length);
}
