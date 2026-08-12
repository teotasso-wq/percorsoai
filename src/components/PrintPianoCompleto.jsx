import { useEffect } from 'react';

const TAG_LABEL = { verificato: 'Verificato', dedotto: 'Dedotto', assunto: 'Assunto', non_trovata: 'Fonte non trovata' };

export default function PrintPianoCompleto({ formData, durata, planData, auditData, onClose }) {
  useEffect(() => {
    document.title = `Piano di studio - ${formData.ambito}`;
  }, [formData.ambito]);

  return (
    <div className="min-h-screen bg-white text-ink px-8 py-10 max-w-3xl mx-auto print:px-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button className="btn-secondary" onClick={onClose}>← Torna al piano</button>
        <button className="btn-primary" onClick={() => window.print()}>Scarica / Stampa PDF</button>
      </div>

      <div className="text-center mb-10 pb-6 border-b-2 border-navy">
        <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">PercorsoAI — Piano di studio</p>
        <h1 className="font-display text-3xl text-navy mb-2">{formData.ambito}</h1>
        <p className="text-ink/60">{formData.obiettivo}</p>
        <p className="text-xs text-ink/40 mt-3">
          Livello: {formData.livello} · Durata: {durata?.weeks} settimane · Generato il {new Date().toLocaleDateString('it-IT')}
        </p>
      </div>

      <h2 className="font-display text-2xl text-navy mb-4">Fasi del percorso</h2>
      <div className="space-y-6 mb-10">
        {planData?.phases?.map((phase) => (
          <div key={phase.id} className="break-inside-avoid border border-navy/15 rounded-xl p-5">
            <h3 className="font-display text-lg text-navy mb-1">{phase.titolo}</h3>
            <p className="text-xs text-ink/50 mb-3">{phase.durata}</p>
            <p className="text-sm mb-3">{phase.obiettivo}</p>
            <p className="text-xs font-bold uppercase text-navy/60 mb-1">Prerequisiti</p>
            <ul className="text-sm list-disc list-inside mb-3">
              {phase.prerequisiti?.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <p className="text-xs font-bold uppercase text-navy/60 mb-1">Competenze chiave</p>
            <ul className="text-sm list-disc list-inside mb-3">
              {phase.competenze?.map((c, i) => (
                <li key={i}>{c.testo} <span className="text-xs text-ink/40">[{TAG_LABEL[c.tag] || c.tag}]</span></li>
              ))}
            </ul>
            <p className="text-xs font-bold uppercase text-navy/60 mb-1">Criterio di completamento</p>
            <p className="text-sm mb-3">{phase.criterio}</p>
            <p className="text-xs font-bold uppercase text-navy/60 mb-1">Output per il portfolio</p>
            <p className="text-sm">{phase.portfolio}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl text-navy mb-4">Fonti</h2>
      <table className="w-full text-sm mb-10 border-collapse">
        <thead>
          <tr className="border-b border-navy/20 text-left">
            <th className="py-2 pr-2">Titolo</th>
            <th className="py-2 pr-2">Tipo</th>
            <th className="py-2 pr-2">Affidabilità</th>
          </tr>
        </thead>
        <tbody>
          {planData?.sources?.map((s, i) => (
            <tr key={i} className="border-b border-navy/10">
              <td className="py-2 pr-2">{s.title}</td>
              <td className="py-2 pr-2 text-ink/60">{s.tipo}</td>
              <td className="py-2 pr-2">{s.affidabilita}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {auditData && (
        <div className="break-inside-avoid border-t-2 border-navy pt-6">
          <h2 className="font-display text-2xl text-navy mb-4">Audit finale</h2>
          <p className="text-sm mb-3"><strong>Simulazione del risultato:</strong> {auditData.simulazione}</p>
          <p className="text-sm mb-4">{auditData.spiegazione}</p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {Object.entries(auditData.kpi || {}).map(([nome, valore]) => (
              <div key={nome}>{nome}: <strong>{valore}/100</strong></div>
            ))}
          </div>
          <p className="text-sm mb-1"><strong>Rischio allucinazioni:</strong> {auditData.rischio}</p>
          <p className="font-display text-xl text-navy mt-3">Verdetto: {auditData.verdetto}</p>
        </div>
      )}
    </div>
  );
}
