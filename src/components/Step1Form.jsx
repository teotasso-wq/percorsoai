import { useState } from 'react';
import { estraiTestoDaPdf } from '../lib/pdfReader';
import { inferisciLivelloDaCv } from '../lib/aiClient';
import { useLingua } from '../lib/LinguaContext';

const AMBITI_SENSIBILI = ['elettric', 'clinic', 'medic', 'chirurg', 'idraulic', 'gas', 'saldatur', 'macchinari'];

export default function Step1Form({ data, onNext }) {
  const { t } = useLingua();
  const [form, setForm] = useState(data);
  const [approfondisci, setApprofondisci] = useState(false);
  const [caricandoCv, setCaricandoCv] = useState(false);
  const [notaCv, setNotaCv] = useState(null);
  const [erroreCv, setErroreCv] = useState(null);

  const gestisciCaricamentoCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.ambito) {
      setErroreCv('Scrivi prima l\'ambito, così posso valutare il CV rispetto a quello.');
      return;
    }
    setCaricandoCv(true);
    setErroreCv(null);
    setNotaCv(null);
    try {
      const testoCv = await estraiTestoDaPdf(file);
      const risultato = await inferisciLivelloDaCv(form.ambito, testoCv);
      setForm((f) => ({ ...f, livello: risultato.livello }));
      setNotaCv(risultato.nota);
      setApprofondisci(true);
    } catch (err) {
      setErroreCv('Non sono riuscito a leggere il PDF: ' + err.message);
    } finally {
      setCaricandoCv(false);
    }
  };

  const ambitoSensibile = AMBITI_SENSIBILI.some((k) =>
    form.ambito.toLowerCase().includes(k)
  );

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const puoiContinuare = form.ambito && form.obiettivo;

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">{t('step1_titolo')}</h1>
      <p className="text-ink/60 mb-8">{t('step1_sottotitolo')}</p>

      <div className="space-y-6">
        <Field label={t('step1_ambito')}>
          <input
            className="input"
            placeholder={t('step1_ambito_placeholder')}
            value={form.ambito}
            onChange={set('ambito')}
          />
        </Field>

        {ambitoSensibile && (
          <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 text-sm text-navy">
            {t('step1_avviso_sensibile')}
          </div>
        )}

        <Field label={t('step1_obiettivo')}>
          <textarea
            className="input min-h-[90px]"
            placeholder={t('step1_obiettivo_placeholder')}
            value={form.obiettivo}
            onChange={set('obiettivo')}
          />
        </Field>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            {t('step1_cv_label')}
          </label>
          <p className="text-xs text-ink/50 mb-2">{t('step1_cv_nota')}</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={gestisciCaricamentoCv}
            disabled={caricandoCv}
            className="text-sm"
          />
          {caricandoCv && <p className="text-xs text-navy/60 mt-2">{t('step1_cv_leggendo')}</p>}
          {notaCv && (
            <p className="text-xs text-verificato mt-2">✓ {t('step1_cv_livello_impostato')} "{form.livello}": {notaCv}</p>
          )}
          {erroreCv && <p className="text-xs text-nonTrovata mt-2">{erroreCv}</p>}
        </div>

        {!approfondisci && (
          <button
            type="button"
            className="text-sm text-navy underline"
            onClick={() => setApprofondisci(true)}
          >
            {t('step1_approfondisci')}
          </button>
        )}

        {approfondisci && (
          <div className="space-y-6 border-t border-navy/10 pt-6">
            <Field label={t('step1_livello')}>
              <select className="input" value={form.livello} onChange={set('livello')}>
                <option value="principiante">{t('step1_livello_principiante')}</option>
                <option value="intermedio">{t('step1_livello_intermedio')}</option>
                <option value="avanzato">{t('step1_livello_avanzato')}</option>
              </select>
            </Field>

            <Field label={t('step1_ore')}>
              <input
                type="number"
                min="1"
                max="40"
                className="input"
                value={form.oreSettimanali}
                onChange={set('oreSettimanali')}
              />
            </Field>

            <Field label={t('step1_criterio')}>
              <textarea
                className="input min-h-[90px]"
                placeholder={t('step1_criterio_placeholder')}
                value={form.criterioSuccesso}
                onChange={set('criterioSuccesso')}
              />
            </Field>
          </div>
        )}

        {!approfondisci && (
          <p className="text-xs text-ink/40">{t('step1_salta_nota')}</p>
        )}
      </div>

      <button
        className="btn-primary mt-10 w-full md:w-auto"
        disabled={!puoiContinuare}
        onClick={() => onNext(form)}
      >
        {t('continua')}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-navy mb-2">{label}</span>
      {children}
    </label>
  );
}
