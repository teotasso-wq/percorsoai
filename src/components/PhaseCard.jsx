import { useState } from 'react';
import Badge from './Badge';
import CopyButton from './CopyButton';

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

export default function PhaseCard({ phase, formData }) {
  const [aperta, setAperta] = useState(false);
  const [spiegazioneVisibile, setSpiegazioneVisibile] = useState(false);

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
          <p className="text-ink">{phase.obiettivo}</p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-2">Prerequisiti</h4>
            <ul className="list-disc list-inside text-sm text-ink/80 space-y-1">
              {phase.prerequisiti.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-2">Competenze chiave</h4>
            <div className="space-y-3">
              {phase.competenze.map((c, i) => (
                <div key={i}>
                  <p className="text-sm text-ink mb-1">{c.testo}</p>
                  <Badge type={c.tag} />
                </div>
              ))}
            </div>
          </div>

          <InfoBox titolo="Criterio di completamento" testo={phase.criterio} />
          <InfoBox titolo="Output per il portfolio" testo={phase.portfolio} />

          {/* Spiegazione diretta — generata al primo click (lazy loading) */}
          <div>
            {!spiegazioneVisibile ? (
              <button
                className="btn-secondary text-sm"
                onClick={() => setSpiegazioneVisibile(true)}
              >
                Mostra spiegazione della fase
              </button>
            ) : (
              <div>
                <h4 className="font-display text-lg text-navy mb-2">Spiegazione della fase</h4>
                <p className="text-sm text-ink/50 italic">
                  Qui comparirà la spiegazione discorsiva generata dall'AI (400-600 parole,
                  con esempi ed etichette Verificato/Dedotto/Assunto) — si attiva quando
                  colleghiamo l'AI vera nella Tappa 3 della guida.
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display text-lg text-navy mb-3">Prompt per NotebookLM</h4>
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
