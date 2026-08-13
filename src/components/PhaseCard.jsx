import { useState } from 'react';
import Badge from './Badge';
import CopyButton from './CopyButton';
import { generaSpiegazione, rigeneraFase, generaAutovalutazione } from '../lib/aiClient';
import { leggiFaseAdAltaVoce, fermaLetturaVocale } from '../lib/textToSpeech';
import { useLingua } from '../lib/LinguaContext';
import { LINGUE_DISPONIBILI } from '../lib/i18n';

function buildNotebookPrompts(phase, formData) {
  return [
    {
      label: 'Sintesi',
      testo: `Usando SOLO le fonti caricate in questo notebook, sintetizza i concetti chiave di: ${phase.competenze.map((c) => c.testo).join('; ')}. Cita sempre il documento di provenienza. Se qualcosa non è coperto dalle fonti, scrivi esplicitamente "non coperto dalle fonti". Livello: ${formData.livello}.`,
    },
    {
      label: 'Verifica',
      testo: `Genera 5 domande per accertare che io sappia: ${phase.criterio} Includi risposte corrette con citazione della fonte.`,
    },
    {
      label: 'Portfolio',
      testo: `Aiutami a strutturare: ${phase.portfolio}`,
    },
    {
      label: 'Collegamento',
      testo: `Spiegami come i concetti di questa fase si collegano alla fase precedente e a cosa serviranno nella fase successiva, usando solo le fonti caricate.`,
    },
    {
      label: 'Quiz finale',
      testo: `Genera un quiz misto di 10 domande, più severo delle 5 di verifica, per accertare che io abbia completato davvero questa fase, basato su: ${phase.criterio} Includi risposte corrette, spiegazione e citazione della fonte per ciascuna.`,
    },
  ];
}

export default function PhaseCard({ phase, formData, onAggiornaFase, pianoSalvato, onSalvaSpiegazione, soloPratica }) {
  const { t, lingua } = useLingua();
  const [aperta, setAperta] = useState(false);
  const [spiegazione, setSpiegazione] = useState(
    pianoSalvato?.spiegazioni?.[phase.id] || null
  );
  const [caricandoSpiegazione, setCaricandoSpiegazione] = useState(false);
  const [erroreSpiegazione, setErroreSpiegazione] = useState(null);
  const [rigenerando, setRigenerando] = useState(null);
  const [autovalutazione, setAutovalutazione] = useState(null);
  const [caricandoAutovalutazione, setCaricandoAutovalutazione] = useState(false);
  const [inAscoltoFase, setInAscoltoFase] = useState(false);

  const codiceVocale = LINGUE_DISPONIBILI.find((l) => l.codice === lingua)?.vocale || 'it-IT';

  const richiediAutovalutazione = () => {
    setCaricandoAutovalutazione(true);
    generaAutovalutazione(formData, phase)
      .then((data) => setAutovalutazione(data.domande || []))
      .catch(() => {})
      .finally(() => setCaricandoAutovalutazione(false));
  };

  const ascoltaFase = () => {
    if (inAscoltoFase) {
      fermaLetturaVocale();
      setInAscoltoFase(false);
      return;
    }
    try {
      leggiFaseAdAltaVoce(phase, codiceVocale);
      setInAscoltoFase(true);
    } catch {
      // silenzioso, se il browser non supporta la lettura vocale
    }
  };

  const richiediSpiegazione = () => {
    // Ottimizzazione 5: se questa fase ha già una spiegazione salvata
    // nel database, non richiamare l'AI — costo zero, stessa qualità.
    const salvata = pianoSalvato?.spiegazioni?.[phase.id];
    if (salvata) {
      setSpiegazione(salvata);
      return;
    }
    setCaricandoSpiegazione(true);
    setErroreSpiegazione(null);
    generaSpiegazione(formData, phase)
      .then((data) => {
        const paragrafi = data.paragrafi || [];
        setSpiegazione(paragrafi);
        onSalvaSpiegazione?.(phase.id, paragrafi);
      })
      .catch((e) => setErroreSpiegazione(e.message))
      .finally(() => setCaricandoSpiegazione(false));
  };

  const adattaDifficolta = async (direzione) => {
    setRigenerando(direzione);
    try {
      const nuovaFase = await rigeneraFase(formData, phase, direzione);
      onAggiornaFase(nuovaFase);
      setSpiegazione(null);
    } catch (e) {
      // Errore silenzioso qui, gestito a livello di riprova manuale
    } finally {
      setRigenerando(null);
    }
  };

  const prompts = buildNotebookPrompts(phase, formData);

  return (
    <div className="border border-navy/15 rounded-2xl bg-white overflow-hidden">
      <button
        className="w-full text-left p-6 flex items-start justify-between gap-4"
        onClick={() => setAperta(!aperta)}
      >
        <div>
          <h3 className="font-display text-xl text-navy mb-1">{phase.titolo}</h3>
          <div className="flex items-center gap-3 text-sm text-ink/60">
            <span>{phase.durata}</span>
            <Badge type={phase.tag} />
          </div>
        </div>
        <span className="text-navy text-xl mt-1">{aperta ? '−' : '+'}</span>
      </button>

      {aperta && (
        <div className="px-6 pb-6 space-y-6 border-t border-navy/10 pt-6">
          {!soloPratica && <p className="text-ink">{phase.obiettivo}</p>}

          {!soloPratica && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-2">{t('fase_prerequisiti')}</h4>
            <ul className="list-disc list-inside text-sm text-ink/80 space-y-1">
              {phase.prerequisiti.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          )}

          {!soloPratica && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-2">{t('fase_competenze')}</h4>
            <div className="space-y-3">
              {phase.competenze.map((c, i) => (
                <div key={i}>
                  <p className="text-sm text-ink mb-1">
                    {c.testo}{' '}
                    {c.tipo_memoria === 'memoria' && (
                      <span className="text-xs text-navy/50" title={t('fase_memoria')}>🧠</span>
                    )}
                    {c.tipo_memoria === 'consultabile' && (
                      <span className="text-xs text-navy/50" title={t('fase_consultabile')}>📖</span>
                    )}
                  </p>
                  <Badge type={c.tag} />
                </div>
              ))}
            </div>
          </div>
          )}

          <InfoBox titolo={t('fase_criterio')} testo={phase.criterio} />
          <InfoBox titolo={t('fase_output')} testo={phase.portfolio} />

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/50">{t('fase_domanda_difficolta')}</span>
            <button
              className="text-xs btn-secondary py-1.5 px-3 disabled:opacity-40"
              onClick={() => adattaDifficolta('troppo_facile')}
              disabled={rigenerando !== null}
            >
              {rigenerando === 'troppo_facile' ? t('fase_adatto') : t('fase_troppo_facile')}
            </button>
            <button
              className="text-xs btn-secondary py-1.5 px-3 disabled:opacity-40"
              onClick={() => adattaDifficolta('troppo_difficile')}
              disabled={rigenerando !== null}
            >
              {rigenerando === 'troppo_difficile' ? t('fase_adatto') : t('fase_troppo_difficile')}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm" onClick={ascoltaFase}>
              {inAscoltoFase ? '⏸ Ferma' : '🔊 Ascolta questa fase'}
            </button>
            {!autovalutazione && !caricandoAutovalutazione && (
              <button className="btn-secondary text-sm" onClick={richiediAutovalutazione}>
                🤔 Autovalutati prima di iniziare
              </button>
            )}
          </div>

          {caricandoAutovalutazione && (
            <p className="text-sm text-navy/60">Preparo le domande...</p>
          )}

          {autovalutazione && (
            <div className="bg-paper border border-navy/10 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-3">
                Prima di iniziare, chiediti:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-ink/80">
                {autovalutazione.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            {!spiegazione && !caricandoSpiegazione && (
              <button className="btn-secondary text-sm" onClick={richiediSpiegazione}>
                {t('fase_mostra_spiegazione')}
              </button>
            )}

            {caricandoSpiegazione && (
              <p className="text-sm text-navy/60">{t('fase_scrivendo_spiegazione')}</p>
            )}

            {erroreSpiegazione && (
              <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy">
                <p className="mb-2">{t('fase_spiegazione_errore')} {erroreSpiegazione}</p>
                <button className="btn-secondary text-sm" onClick={richiediSpiegazione}>
                  {t('riprova')}
                </button>
              </div>
            )}

            {spiegazione && (
              <div>
                <h4 className="font-display text-lg text-navy mb-3">{t('fase_spiegazione_titolo')}</h4>
                <div className="space-y-3">
                  {spiegazione.map((p, i) => (
                    <div key={i}>
                      <p className="text-sm text-ink mb-1">{p.testo}</p>
                      <Badge type={p.tag} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display text-lg text-navy mb-3">{t('fase_notebooklm_titolo')}</h4>
            <div className="space-y-3">
              {prompts.map((p, i) => (
                <div key={i} className="bg-paper border border-navy/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-navy/70">{p.label}</span>
                    <CopyButton text={p.testo} />
                  </div>
                  <p className="text-sm text-ink/70">{p.testo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ titolo, testo }) {
  return (
    <div className="bg-paper border border-navy/10 rounded-xl p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-1">{titolo}</h4>
      <p className="text-sm text-ink/80">{testo}</p>
    </div>
  );
}
