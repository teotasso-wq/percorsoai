import { useState } from 'react';

const AMBITI_SENSIBILI = ['elettric', 'clinic', 'medic', 'chirurg', 'idraulic', 'gas', 'saldatur', 'macchinari'];

export default function Step1Form({ data, onNext }) {
  const [form, setForm] = useState(data);

  const ambitoSensibile = AMBITI_SENSIBILI.some((k) =>
    form.ambito.toLowerCase().includes(k)
  );

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const puoiContinuare = form.ambito && form.obiettivo && form.criterioSuccesso && form.oreSettimanali;

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
