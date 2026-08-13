import { useEffect, useState } from 'react';
import { generaAudit } from '../lib/aiClient';
import { useLingua } from '../lib/LinguaContext';

const RISCHIO_COLORE = {
  Basso: 'bg-verificato/10 text-verificato',
  Medio: 'bg-dedotto/10 text-dedotto',
  Alto: 'bg-nonTrovata/10 text-nonTrovata',
};

export default function Step4Audit({ formData, planData, auditDataIniziale, onAuditReady, onBack, onExportPiano, onExportPortfolio }) {
  const { t } = useLingua();
  const [audit, setAudit] = useState(auditDataIniziale);
  const [errore, setErrore] = useState(null);
  const [caricando, setCaricando] = useState(!auditDataIniziale);
  const [testoCopiato, setTestoCopiato] = useState(false);

  // Onda I, idea 150: testo semplice pronto da incollare in Notion,
  // Todoist o qualunque altro strumento — nessuna integrazione tecnica,
  // solo un formato leggibile ovunque.
  const costruisciTestoPiano = () => {
    let testo = `${formData.ambito}\n${formData.obiettivo}\n\n`;
    planData.phases.forEach((fase, i) => {
      testo += `${i + 1}. ${fase.titolo} (${fase.durata})\n   ${fase.obiettivo}\n\n`;
    });
    return testo;
  };

  const copiaComeTesto = async () => {
    try {
      await navigator.clipboard.writeText(costruisciTestoPiano());
      setTestoCopiato(true);
      setTimeout(() => setTestoCopiato(false), 1500);
    } catch {
      // silenzioso
    }
  };

  // Onda I, idea 152: condivisione rapida via WhatsApp — un link con
  // testo precompilato, nessun file necessario.
  const condividiWhatsApp = () => {
    const messaggio = `Ho creato un piano di studio su PercorsoAI: ${formData.ambito}\n${formData.obiettivo}`;
    const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (auditDataIniziale) return;
    setCaricando(true);
    setErrore(null);
    generaAudit(formData, planData)
      .then((data) => {
        setAudit(data);
        onAuditReady(data);
      })
      .catch((e) => setErrore(e.message))
      .finally(() => setCaricando(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-8">{t('step4_titolo')}</h1>

      {caricando && <div className="text-navy/60 text-sm py-8">{t('step4_caricamento')}</div>}

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          {t('step4_errore')} {errore}
        </div>
      )}

      {audit && (
        <>
          <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-2xl text-navy mb-4">{t('step4_simulazione_titolo')}</h2>
            <div className="bg-verificato/10 border border-verificato/30 rounded-xl p-4">
              <p className="font-semibold text-navy mb-1">
                {t('step4_simulazione_domanda')} {audit.simulazione}
              </p>
              <p className="text-sm text-ink/70">{audit.spiegazione}</p>
            </div>
          </div>

          <div className="bg-white border border-navy/15 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-2xl text-navy mb-5">{t('step4_kpi_titolo')}</h2>
            <div className="space-y-5">
              {Object.entries(audit.kpi).map(([nome, valore]) => (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">{nome}</span>
                    <span className="text-navy/60">{valore}/100</span>
                  </div>
                  <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full" style={{ width: `${valore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-navy/15 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-navy/60 mb-3">{t('step4_rischio_titolo')}</h3>
              <span className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm ${RISCHIO_COLORE[audit.rischio]}`}>
                {audit.rischio}
              </span>
            </div>
            <div className="bg-white border border-navy/15 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-navy/60 mb-3">{t('step4_verdetto_titolo')}</h3>
              <p className="font-display text-2xl text-navy">{audit.verdetto}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <button className="btn-secondary" onClick={onExportPortfolio}>{t('step4_esporta_portfolio')}</button>
            <button className="btn-primary" onClick={onExportPiano}>{t('step4_esporta_piano')}</button>
            <button className="btn-secondary" onClick={copiaComeTesto}>
              {testoCopiato ? 'Copiato ✓' : '📋 Copia come testo'}
            </button>
            <button className="btn-secondary" onClick={condividiWhatsApp}>
              💬 Condividi su WhatsApp
            </button>
          </div>
        </>
      )}

      <button className="btn-secondary" onClick={onBack}>{t('indietro')}</button>
    </div>
  );
}
