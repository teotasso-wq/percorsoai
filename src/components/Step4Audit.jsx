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
          </div>
        </>
      )}

      <button className="btn-secondary" onClick={onBack}>{t('indietro')}</button>
    </div>
  );
}
