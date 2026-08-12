import { useState } from 'react';
import { estraiTestoDaPdf } from '../lib/pdfReader';
import { inferisciLivelloDaCv } from '../lib/aiClient';

const AMBITI_SENSIBILI = ['elettric', 'clinic', 'medic', 'chirurg', 'idraulic', 'gas', 'saldatur', 'macchinari'];

export default function Step1Form({ data, onNext }) {
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

  // Solo ambito e obiettivo sono davvero obbligatori: il resto ha valori
  // di default sensati, così chi ha fretta può procedere subito.
  const puoiContinuare = form.ambito && form.obiettivo;

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">Che cosa vuoi imparare?</h1>
      <p className="text-ink/60 mb-8">Rispondi con parole tue, senza preoccuparti della forma.</p>

      <div className="space-y-6">
        <Field label="Ambito o ruolo da imparare">
          <input
            className="input"
            placeholder="Es. Progettista meccanico, AI Strategist, Qlik..."
            value={form.ambito}
            onChange={set('ambito')}
          />
        </Field>

        {ambitoSensibile && (
          <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 text-sm text-navy">
            ⚠️ Questo ambito riguarda attività manuali, fisiche o regolamentate.
            Il piano che riceverai non sostituisce pratica supervisionata,
            certificazioni ufficiali o professionisti abilitati.
          </div>
        )}

        <Field label="Obiettivo operativo — cosa vuoi saper fare davvero">
          <textarea
            className="input min-h-[90px]"
            placeholder="Es. Voglio saper progettare organi macchina in autonomia"
            value={form.obiettivo}
            onChange={set('obiettivo')}
          />
        </Field>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Carica il tuo CV (facoltativo, PDF)
          </label>
          <p className="text-xs text-ink/50 mb-2">
            Lo usiamo solo per capire il tuo livello di partenza reale — non viene salvato da nessuna parte.
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={gestisciCaricamentoCv}
            disabled={caricandoCv}
            className="text-sm"
          />
          {caricandoCv && <p className="text-xs text-navy/60 mt-2">Sto leggendo il CV...</p>}
          {notaCv && (
            <p className="text-xs text-verificato mt-2">✓ Livello impostato su "{form.livello}": {notaCv}</p>
          )}
          {erroreCv && <p className="text-xs text-nonTrovata mt-2">{erroreCv}</p>}
        </div>

        {!approfondisci && (
          <button
            type="button"
            className="text-sm text-navy underline"
            onClick={() => setApprofondisci(true)}
          >
            Approfondisci (consigliato, richiede 1 minuto in più)
          </button>
        )}

        {approfondisci && (
          <div className="space-y-6 border-t border-navy/10 pt-6">
            <Field label="Livello di partenza">
              <select className="input" value={form.livello} onChange={set('livello')}>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzato">Avanzato</option>
              </select>
            </Field>

            <Field label="Ore disponibili a settimana">
              <input
                type="number"
                min="1"
                max="40"
                className="input"
                value={form.oreSettimanali}
                onChange={set('oreSettimanali')}
              />
            </Field>

            <Field label="Come saprai di aver raggiunto l'obiettivo?">
              <textarea
                className="input min-h-[90px]"
                placeholder="Es. Saprò progettare un componente completo con calcoli e disegno"
                value={form.criterioSuccesso}
                onChange={set('criterioSuccesso')}
              />
            </Field>
          </div>
        )}

        {!approfondisci && (
          <p className="text-xs text-ink/40">
            Se salti questa parte, useremo valori standard (principiante, 6 ore/settimana) — potrai sempre rigenerare il piano dopo.
          </p>
        )}
      </div>

      <button
        className="btn-primary mt-10 w-full md:w-auto"
        disabled={!puoiContinuare}
        onClick={() => onNext(form)}
      >
        Continua
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
