// Dati DIMOSTRATIVI: servono a vedere l'app funzionare subito, prima di
// collegare l'AI vera (Tappa 3 della guida). Non sono generati da nessuna
// ricerca reale — sono solo un esempio per testare l'interfaccia.

export const DEMO_DURATIONS = [
  { id: 'minima', label: 'Minima realistica', weeks: 6, note: 'Solo i concetti essenziali, ritmo intenso.' },
  { id: 'consigliata', label: 'Consigliata', weeks: 10, note: 'Buon equilibrio tra ritmo e comprensione.' },
  { id: 'comoda', label: 'Comoda', weeks: 14, note: 'Più tempo per fare pratica ed esercizi.' },
];

export const DEMO_SOURCES = [
  { title: 'Documentazione ufficiale (esempio)', tipo: 'documentazione', affidabilita: 'Alta', notebooklm: true, stato: 'verificato', url: '#' },
  { title: 'Corso strutturato (esempio)', tipo: 'corso', affidabilita: 'Alta', notebooklm: true, stato: 'verificato', url: '#' },
  { title: 'Articolo tecnico (esempio)', tipo: 'articolo', affidabilita: 'Media', notebooklm: false, stato: 'verificato', url: '#' },
];

export const DEMO_PHASES = [
  {
    id: 1,
    titolo: 'Fase 1 — Fondamenti',
    durata: '2 sett. · 6 h/sett.',
    tag: 'dedotto',
    obiettivo: 'Acquisire le basi concettuali necessarie per procedere.',
    prerequisiti: ['Nessuna conoscenza pregressa richiesta.'],
    competenze: [
      { testo: 'Riconoscere i concetti fondamentali dell\'ambito scelto.', tag: 'verificato' },
      { testo: 'Usare correttamente la terminologia di base.', tag: 'verificato' },
    ],
    criterio: 'Una terza persona verifica che tu sappia spiegare i concetti chiave con parole tue.',
    portfolio: 'Un breve documento che riassume i concetti fondamentali con esempi propri.',
  },
  {
    id: 2,
    titolo: 'Fase 2 — Applicazione guidata',
    durata: '3 sett. · 6 h/sett.',
    tag: 'dedotto',
    obiettivo: 'Applicare i concetti in esercizi pratici crescenti.',
    prerequisiti: ['Completamento della Fase 1.'],
    competenze: [
      { testo: 'Risolvere esercizi pratici di livello base.', tag: 'verificato' },
      { testo: 'Riconoscere errori comuni e correggerli.', tag: 'dedotto' },
    ],
    criterio: 'Completamento di 5 esercizi pratici con correzione.',
    portfolio: 'Una raccolta di esercizi risolti con spiegazione.',
  },
];

export const DEMO_AUDIT = {
  simulazione: 'SÌ',
  spiegazione: 'Il percorso copre prerequisiti, progressione e output pratici in modo coerente con le ore dichiarate.',
  kpi: {
    'Completezza': 100,
    'Copertura prerequisiti': 100,
    'Progressione didattica': 85,
    'Coerenza carico-tempo': 100,
    'Qualità fonti': 90,
    'Rapporto teoria-pratica': 95,
  },
  rischio: 'Basso',
  verdetto: 'APPROVATO',
};
