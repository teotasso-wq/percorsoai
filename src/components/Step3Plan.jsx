import { useEffect, useState } from 'react';
import PhaseCard from './PhaseCard';
import Badge from './Badge';
import ObiettivoSettimanale from './ObiettivoSettimanale';
import { generaPiano, rigeneraFonte, traduciPiano } from '../lib/aiClient';
import { leggiPianoAdAltaVoce, fermaLetturaVocale } from '../lib/textToSpeech';
import { useLingua } from '../lib/LinguaContext';
import { LINGUE_DISPONIBILI } from '../lib/i18n';

export default function Step3Plan({ formData, duration, onNext, onBack, onPlanReady, planData, pianoSalvato, onSalvaObiettivo, onSegnala }) {
  const { t, lingua, setLingua } = useLingua();
  const [caricando, setCaricando] = useState(!planData);
  const [errore, setErrore] = useState(null);
  const [tentativo, setTentativo] = useState(0);
  const [rigenerandoIndice, setRigenerandoIndice] = useState(null);
  const [traducendo, setTraducendo] = useState(false);
  const [inAscolto, setInAscolto] = useState(false);

  const LINGUE_TRADUZIONE = LINGUE_DISPONIBILI;

  const rigenera = async (indice) => {
    setRigenerandoIndice(indice);
    try {
      const nuovaFonte = await rigeneraFonte(formData, planData.sources[indice]);
      const nuoveFonti = [...planData.sources];
      nuoveFonti[indice] = nuovaFonte;
      onPlanReady({ ...planData, sources: nuoveFonti });
    } catch (e) {
      setErrore('Non sono riuscito a trovare una fonte alternativa: ' + e.message);
    } finally {
      setRigenerandoIndice(null);
    }
  };

  const segnala = (indice) => {
    onSegnala({
      tipo: 'fonte',
      riferimento: planData.sources[indice].title,
      data: new Date().toISOString(),
    });
  };

  const traduci = async (linguaScelta) => {
    // Ottimizzazione 7: se sei già in questa lingua, non fare nulla.
    if (linguaScelta.codice === lingua) return;

    // Ottimizzazione 8: se questa lingua è già stata tradotta prima,
    // usa la versione salvata invece di richiamare l'AI.
    const traduzioneSalvata = pianoSalvato?.traduzioni?.[linguaScelta.codice];
    if (traduzioneSalvata) {
      onPlanReady(traduzioneSalvata);
      setLingua(linguaScelta.codice);
      return;
    }

    setTraducendo(true);
    try {
      const piano = { sources: planData.sources, phases: planData.phases };
      const tradotto = await traduciPiano(piano, linguaScelta.linguaAI);
      onPlanReady(tradotto);
      setLingua(linguaScelta.codice);
      const nuoveTraduzioni = { ...(pianoSalvato?.traduzioni || {}), [linguaScelta.codice]: tradotto };
      onSalvaObiettivo({ traduzioni: nuoveTraduzioni });
    } catch (e) {
      setErrore('Non sono riuscito a tradurre il piano: ' + e.message);
    } finally {
      setTraducendo(false);
    }
  };

  const codiceVocaleAttuale = LINGUE_DISPONIBILI.find((l) => l.codice === lingua)?.vocale || 'it-IT';

  const ascolta = () => {
    if (inAscolto) {
      fermaLetturaVocale();
      setInAscolto(false);
      return;
    }
    try {
      leggiPianoAdAltaVoce(planData, formData.ambito, codiceVocaleAttuale);
      setInAscolto(true);
    } catch (e) {
      setErrore(e.message);
    }
  };

  useEffect(() => {
    if (planData) return;
    setCaricando(true);
    setErrore(null);
    generaPiano(formData, duration)
      .then((data) => onPlanReady(data))
      .catch((e) => setErrore(e.message))
      .finally(() => setCaricando(false));
  }, [tentativo]);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">{t('step3_titolo')}</h1>
      <p className="text-ink/60 mb-8">{t('step3_sottotitolo')}</p>

      {planData && (
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            className={`btn-secondary text-sm ${inAscolto ? 'bg-navy text-paper' : ''}`}
            onClick={ascolta}
          >
            {inAscolto ? t('step3_ferma_lettura') : t('step3_ascolta')}
          </button>
          {LINGUE_TRADUZIONE.map((l) => (
            <button
              key={l.codice}
              className="btn-secondary text-sm disabled:opacity-40"
              onClick={() => traduci(l)}
              disabled={traducendo}
            >
              {traducendo ? t('step3_traducendo') : `🌐 ${l.etichetta}`}
            </button>
          ))}
        </div>
      )}

      {planData && pianoSalvato && (
        <ObiettivoSettimanale piano={pianoSalvato} onSalva={onSalvaObiettivo} />
      )}

      {caricando && (
        <div className="text-navy/60 text-sm py-8">{t('step3_caricamento')}</div>
      )}

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          <p className="mb-3">{t('step3_errore')} {errore}</p>
          <button className="btn-secondary text-sm" onClick={() => setTentativo((t) => t + 1)}>
            {t('riprova')}
          </button>
        </div>
      )}

      {planData && (
        <>
          <div className="space-y-4 mb-10">
            {planData.phases.map((phase, indice) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                formData={formData}
                pianoSalvato={pianoSalvato}
                onSalvaSpiegazione={(faseId, paragrafi) => {
                  const nuoveSpiegazioni = { ...(pianoSalvato?.spiegazioni || {}), [faseId]: paragrafi };
                  onSalvaObiettivo({ spiegazioni: nuoveSpiegazioni });
                }}
                onAggiornaFase={(nuovaFase) => {
                  const nuoveFasi = [...planData.phases];
                  nuoveFasi[indice] = nuovaFase;
                  onPlanReady({ ...planData, phases: nuoveFasi });
                }}
              />
            ))}
          </div>

          <div className="bg-white border border-navy/15 rounded-2xl p-6">
            <h2 className="font-display text-2xl text-navy mb-2">{t('step3_fonti_titolo')}</h2>
            <p className="text-sm text-ink/60 mb-4">{t('step3_fonti_nota')}</p>
            <div className="flex gap-2 flex-wrap mb-6">
              <Badge type="verificato" />
              <Badge type="dedotto" />
              <Badge type="assunto" />
              <Badge type="non_trovata" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-navy/60 border-b border-navy/10">
                    <th className="py-2 pr-4">{t('step3_fonti_col_titolo')}</th>
                    <th className="py-2 pr-4">{t('step3_fonti_col_tipo')}</th>
                    <th className="py-2 pr-4">{t('step3_fonti_col_affidabilita')}</th>
                    <th className="py-2 pr-4">{t('step3_fonti_col_link')}</th>
                    <th className="py-2">{t('step3_fonti_col_azioni')}</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.sources.map((s, i) => (
                    <tr key={i} className="border-b border-navy/5">
                      <td className="py-3 pr-4">{s.title}</td>
                      <td className="py-3 pr-4 text-ink/60">{s.tipo}</td>
                      <td className="py-3 pr-4">{s.affidabilita}</td>
                      <td className="py-3 pr-4">
                        {s.url && s.url !== '#' ? (
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-navy underline">{t('step3_fonti_apri')}</a>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2 items-center">
                          <button
                            className="text-xs text-navy underline disabled:opacity-40"
                            onClick={() => rigenera(i)}
                            disabled={rigenerandoIndice === i}
                          >
                            {rigenerandoIndice === i ? t('step3_fonti_rigenerando') : t('step3_fonti_rigenera')}
                          </button>
                          <button className="text-xs text-nonTrovata underline" onClick={() => segnala(i)}>
                            {t('step3_fonti_segnala')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between mt-10">
        <button className="btn-secondary" onClick={onBack}>{t('indietro')}</button>
        {planData && (
          <button className="btn-primary" onClick={onNext}>{t('step3_audit_button')}</button>
        )}
      </div>
    </div>
  );
}
