import { useEffect, useState } from 'react';
import PhaseCard from './PhaseCard';
import Badge from './Badge';
import { generaPiano } from '../lib/aiClient';

export default function Step3Plan({ formData, duration, onNext, onBack, onPlanReady, planData }) {
  const [caricando, setCaricando] = useState(!planData);
  const [errore, setErrore] = useState(null);
  const [tentativo, setTentativo] = useState(0);

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
      <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">Il tuo percorso</h1>
      <p className="text-ink/60 mb-8">
        Ogni fase mostra obiettivo, prerequisiti, competenze e i materiali per studiare.
      </p>

      {caricando && (
        <div className="text-navy/60 text-sm py-8">
          Sto cercando fonti reali e costruendo le fasi — può richiedere 20-40 secondi.
          Tieni lo schermo acceso e non cambiare app fino alla fine.
        </div>
      )}

      {errore && (
        <div className="bg-nonTrovata/10 border border-nonTrovata/30 rounded-xl p-4 text-sm text-navy mb-6">
          <p className="mb-3">Non sono riuscito a generare il piano: {errore}</p>
          <button className="btn-secondary text-sm" onClick={() => setTentativo((t) => t + 1)}>
            Riprova
          </button>
        </div>
      )}

      {planData && (
        <>
          <div className="space-y-4 mb-10">
            {planData.phases.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} formData={formData} />
            ))}
          </div>

          <div className="bg-white border border-navy/15 rounded-2xl p-6">
            <h2 className="font-display text-2xl text-navy mb-2">Fonti</h2>
            <p className="text-sm text-ink/60 mb-4">
              Nessuna fonte inventata: dove non esiste un riferimento affidabile lo dichiariamo.
            </p>
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
                    <th className="py-2 pr-4">Titolo</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Affidabilità</th>
                    <th className="py-2">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.sources.map((s, i) => (
                    <tr key={i} className="border-b border-navy/5">
                      <td className="py-3 pr-4">{s.title}</td>
                      <td className="py-3 pr-4 text-ink/60">{s.tipo}</td>
                      <td className="py-3 pr-4">{s.affidabilita}</td>
                      <td className="py-3">
                        {s.url && s.url !== '#' ? (
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-navy underline">Apri</a>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
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
        <button className="btn-secondary" onClick={onBack}>← Indietro</button>
        {planData && (
          <button className="btn-primary" onClick={onNext}>Esegui l'audit →</button>
        )}
      </div>
    </div>
  );
}
