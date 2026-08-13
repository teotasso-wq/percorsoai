import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { suggerisciProssimoPiano } from '../lib/aiClient';
import { useLingua } from '../lib/LinguaContext';
import ChecklistPrimiPassi from './ChecklistPrimiPassi';

// Onda H, idea 176: piccolo indice statico della Guida, per la ricerca
// unica. Non serve leggere il contenuto vero, solo sapere in quale
// sezione cercare quando l'utente digita qualcosa che non trova nei piani.
const INDICE_GUIDA = [
  { titolo: 'Come funziona l\'app', parole: ['step', 'come funziona', 'iniziare', 'percorso'] },
  { titolo: 'Primi passi con NotebookLM', parole: ['notebooklm', 'gemini notebook', 'fonti'] },
  { titolo: 'In che ordine usare i 5 prompt', parole: ['prompt', 'sintesi', 'verifica', 'quiz'] },
  { titolo: 'Consiglio: correggi presto', parole: ['troppo facile', 'troppo difficile', 'difficoltà'] },
  { titolo: 'Domande frequenti', parole: ['faq', 'domande', 'fonte non trovata', 'tag', 'colori'] },
];

export default function MyPlans({ onOpen, onNewPlan, onApriGuida }) {
  const { t } = useLingua();
  const [piani, setPiani] = useState(null);
  const [errore, setErrore] = useState(null);
  const [ricerca, setRicerca] = useState('');
  const [confermaCancellazione, setConfermaCancellazione] = useState(false);
  const [cancellando, setCancellando] = useState(false);
  const [suggerimento, setSuggerimento] = useState(null);
  const [confermaEliminaId, setConfermaEliminaId] = useState(null);
  const [mostraStatSettimana, setMostraStatSettimana] = useState(false);
  const [modalitaUnione, setModalitaUnione] = useState(false);
  const [selezionati, setSelezionati] = useState([]);
  const [unendo, setUnendo] = useState(false);

  const eliminaPiano = async (id) => {
    await supabase.from('piani').delete().eq('id', id);
    setConfermaEliminaId(null);
    caricaPiani();
  };

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

  // Onda H, idea 176: se la ricerca non trova piani, controlla anche
  // l'indice della Guida.
  const risultatiGuida = ricerca
    ? INDICE_GUIDA.filter((sez) =>
        sez.parole.some((p) => p.includes(ricerca.toLowerCase()) || ricerca.toLowerCase().includes(p))
      )
    : [];

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

  // Onda G, idea 175: statistiche di questa settimana, calcolate solo
  // quando l'utente le chiede esplicitamente.
  const unaSettimanaFa = new Date();
  unaSettimanaFa.setDate(unaSettimanaFa.getDate() - 7);
  const pianiQuestaSettimana = (piani || []).filter(
    (p) => new Date(p.created_at) >= unaSettimanaFa
  ).length;
  const completatiQuestaSettimana = completati.filter(
    (p) => new Date(p.updated_at || p.created_at) >= unaSettimanaFa
  ).length;

  // Onda H, idea 149: ambito preferito, calcolato dai piani passati.
  // Semplice: se un ambito ricorre più di una volta, lo segnaliamo.
  const conteggioAmbiti = {};
  completati.forEach((p) => {
    const a = p.form_data?.ambito;
    if (a) conteggioAmbiti[a] = (conteggioAmbiti[a] || 0) + 1;
  });
  const ambitoPreferito = Object.entries(conteggioAmbiti).sort((a, b) => b[1] - a[1])[0];
  const mostraAmbitoPreferito = ambitoPreferito && ambitoPreferito[1] > 1;

  // Onda H, idea 57: unire due piani completati in un percorso unico.
  const toggleSelezione = (id) => {
    setSelezionati((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 2 ? [...sel, id] : sel
    );
  };

  const unisciPiani = async () => {
    if (selezionati.length !== 2) return;
    setUnendo(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const [p1, p2] = selezionati.map((id) => piani.find((p) => p.id === id));

    const faseCombinata = [
      ...(p1.plan_data?.phases || []),
      ...(p2.plan_data?.phases || []).map((f) => ({ ...f, id: f.id + 100 })),
    ];
    const fontiCombinate = [...(p1.plan_data?.sources || []), ...(p2.plan_data?.sources || [])];
    const settimaneTotali = (p1.duration_data?.weeks || 0) + (p2.duration_data?.weeks || 0);

    const { data } = await supabase
      .from('piani')
      .insert({
        user_id: userId,
        form_data: {
          ambito: `${p1.form_data?.ambito} + ${p2.form_data?.ambito}`,
          obiettivo: `Percorso unito: ${p1.form_data?.obiettivo} — ${p2.form_data?.obiettivo}`,
          livello: p1.form_data?.livello,
          oreSettimanali: p1.form_data?.oreSettimanali,
          criterioSuccesso: '',
        },
        duration_data: { weeks: settimaneTotali },
        plan_data: { phases: faseCombinata, sources: fontiCombinate },
        status: 'bozza',
      })
      .select()
      .single();

    setUnendo(false);
    setModalitaUnione(false);
    setSelezionati([]);
    if (data) onOpen(data);
  };

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
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatBox numero={totale} etichetta={t('piani_totali')} />
          <StatBox numero={numCompletati} etichetta={t('piani_completati_stat')} />
          <StatBox numero={`${tassoCompletamento}%`} etichetta={t('piani_tasso')} />
        </div>
      )}

      {totale > 0 && (
        <div className="mb-6">
          {!mostraStatSettimana ? (
            <button className="text-xs text-navy/50 underline" onClick={() => setMostraStatSettimana(true)}>
              Vedi le statistiche di questa settimana
            </button>
          ) : (
            <div className="bg-paper border border-navy/10 rounded-xl p-4 text-sm text-ink/80">
              <p>Piani creati negli ultimi 7 giorni: <strong>{pianiQuestaSettimana}</strong></p>
              <p>Piani completati negli ultimi 7 giorni: <strong>{completatiQuestaSettimana}</strong></p>
              <button className="text-xs text-navy/50 underline mt-2" onClick={() => setMostraStatSettimana(false)}>
                Nascondi
              </button>
            </div>
          )}
        </div>
      )}

      {mostraAmbitoPreferito && (
        <p className="text-xs text-ink/50 mb-6">
          Il tuo ambito preferito finora: <strong className="text-navy/70">{ambitoPreferito[0]}</strong> ({ambitoPreferito[1]} piani)
        </p>
      )}

      <ChecklistPrimiPassi onNewPlan={() => onNewPlan()} onApriGuida={onApriGuida} />

      {daRiprendere && (
        <div className="bg-navy text-paper rounded-2xl p-6 mb-8">
          <button onClick={() => onOpen(daRiprendere)} className="w-full text-left">
            <p className="text-xs uppercase tracking-wide opacity-70 mb-1">{t('piani_riprendi')}</p>
            <h3 className="font-display text-xl mb-1">
              {daRiprendere.form_data?.ambito || 'Piano senza titolo'}
            </h3>
            <p className="text-sm opacity-80">{daRiprendere.form_data?.obiettivo}</p>
          </button>
          {confermaEliminaId === daRiprendere.id ? (
            <div className="mt-3 pt-3 border-t border-paper/20 flex items-center gap-3">
              <span className="text-xs opacity-70">Eliminare questa bozza?</span>
              <button className="text-xs underline opacity-70" onClick={() => setConfermaEliminaId(null)}>
                Annulla
              </button>
              <button className="text-xs underline font-semibold" onClick={() => eliminaPiano(daRiprendere.id)}>
                Elimina
              </button>
            </div>
          ) : (
            <button
              className="mt-3 pt-3 border-t border-paper/20 w-full text-left text-xs underline opacity-60"
              onClick={() => setConfermaEliminaId(daRiprendere.id)}
            >
              Elimina bozza
            </button>
          )}
        </div>
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
            {completati.length >= 2 && !modalitaUnione && (
              <button className="text-xs text-navy/50 underline" onClick={() => setModalitaUnione(true)}>
                Unisci due piani
              </button>
            )}
            {modalitaUnione && (
              <button
                className="text-xs text-nonTrovata underline"
                onClick={() => { setModalitaUnione(false); setSelezionati([]); }}
              >
                Annulla unione
              </button>
            )}
          </div>

          {modalitaUnione && (
            <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-3 mb-4 text-xs text-navy flex items-center justify-between">
              <span>Seleziona 2 piani da unire ({selezionati.length}/2)</span>
              <button
                className="btn-secondary text-xs disabled:opacity-40"
                disabled={selezionati.length !== 2 || unendo}
                onClick={unisciPiani}
              >
                {unendo ? 'Unisco...' : 'Unisci'}
              </button>
            </div>
          )}

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
                <div key={p.id} className="bg-white border border-navy/15 rounded-2xl p-5 hover:border-navy transition-colors flex items-start gap-3">
                  {modalitaUnione && (
                    <input
                      type="checkbox"
                      className="mt-1.5"
                      checked={selezionati.includes(p.id)}
                      onChange={() => toggleSelezione(p.id)}
                    />
                  )}
                  <div className="flex-1">
                    <button onClick={() => !modalitaUnione && onOpen(p)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl text-navy mb-1">
                            {p.form_data?.ambito || 'Piano senza titolo'}
                            {p.esempio && (
                              <span className="ml-2 text-[10px] align-middle bg-dedotto/15 text-dedotto px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Esempio
                              </span>
                            )}
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

                    {!modalitaUnione && (confermaEliminaId === p.id ? (
                      <div className="mt-3 pt-3 border-t border-navy/10 flex items-center gap-3">
                        <span className="text-xs text-navy/60">Eliminare questo piano?</span>
                        <button className="text-xs text-navy/50 underline" onClick={() => setConfermaEliminaId(null)}>
                          Annulla
                        </button>
                        <button className="text-xs text-nonTrovata font-semibold underline" onClick={() => eliminaPiano(p.id)}>
                          Elimina
                        </button>
                      </div>
                    ) : (
                      <button
                        className="mt-3 pt-3 border-t border-navy/10 w-full text-left text-xs text-nonTrovata/70 underline"
                        onClick={() => setConfermaEliminaId(p.id)}
                      >
                        Elimina piano
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {completatiFiltrati.length === 0 && risultatiGuida.length === 0 && (
              <p className="text-sm text-ink/50">{t('piani_nessun_risultato')} "{ricerca}".</p>
            )}
            {risultatiGuida.length > 0 && (
              <div className="bg-paper border border-navy/10 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-navy/50 mb-2">Nella Guida</p>
                {risultatiGuida.map((sez, i) => (
                  <button
                    key={i}
                    className="block text-sm text-navy underline mb-1"
                    onClick={onApriGuida}
                  >
                    {sez.titolo}
                  </button>
                ))}
              </div>
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
    <div className="bg-white border border-navy/15 rounded-xl px-2 py-3 text-center overflow-hidden">
      <p className="font-display text-xl md:text-2xl text-navy">{numero}</p>
      <p className="text-[11px] leading-tight text-ink/50 mt-1 break-words">{etichetta}</p>
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
