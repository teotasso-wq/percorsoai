import { useState } from 'react';
import { useLingua } from '../lib/LinguaContext';

const SEZIONI = [
  {
    id: 'come-funziona',
    titolo: 'Come funziona l\'app',
    contenuto: (
      <div className="space-y-4">
        {[
          { numero: 1, titolo: 'Racconta cosa vuoi imparare', testo: 'Ambito, obiettivo, e facoltativamente livello, ore disponibili e criterio di successo.' },
          { numero: 2, titolo: 'Scegli la durata', testo: 'L\'AI propone 3 durate possibili. Ne scegli una — potrai sempre rigenerare dopo.' },
          { numero: 3, titolo: 'Ricevi il piano verificato', testo: 'Fasi, competenze e fonti reali trovate con ricerca web vera, con tag di affidabilità su ogni affermazione.' },
          { numero: 4, titolo: 'Controlla l\'audit finale', testo: 'Un giudizio onesto su quanto il piano è solido, prima di iniziare a studiare davvero.' },
        ].map((s) => (
          <div key={s.numero} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-paper flex items-center justify-center font-display font-bold text-sm shrink-0">
              {s.numero}
            </div>
            <div>
              <p className="font-semibold text-navy text-sm mb-1">{s.titolo}</p>
              <p className="text-sm text-ink/70">{s.testo}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'notebooklm-primi-passi',
    titolo: 'Primi passi con NotebookLM',
    contenuto: (
      <div className="space-y-4 text-sm text-ink/80">
        <p>NotebookLM è uno strumento gratuito di Google pensato per studiare a partire da fonti reali — perfetto per usare i prompt che l'app genera per ogni fase.</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Vai su <strong>notebooklm.google.com</strong> e accedi con un account Google</li>
          <li>Tocca <strong>"Nuovo notebook"</strong></li>
          <li>Carica le fonti: nella tabella "Fonti" dell'app, apri i link segnati "sì" per NotebookLM e caricali come sorgenti nel notebook</li>
          <li>Vai su una fase, apri "Prompt per NotebookLM", copia il primo (Sintesi) e incollalo nella chat di NotebookLM</li>
        </ol>
        <p className="text-xs text-ink/50">Se una fonte non è caricabile in NotebookLM (colonna "no" nella tabella), va bene lo stesso — usala come lettura a parte.</p>
      </div>
    ),
  },
  {
    id: 'ordine-prompt',
    titolo: 'In che ordine usare i 5 prompt',
    contenuto: (
      <div className="space-y-3">
        {[
          { nome: 'Sintesi', testo: 'Parti sempre da qui: ti dà una spiegazione dei concetti chiave della fase, solo dalle fonti caricate.' },
          { nome: 'Verifica', testo: '5 domande brevi per un primo controllo — usale dopo aver letto la sintesi.' },
          { nome: 'Portfolio', testo: 'Ti aiuta a costruire l\'output pratico della fase — usalo quando ti senti pronto a fare, non solo a leggere.' },
          { nome: 'Collegamento', testo: 'Chiarisce come questa fase si lega alla precedente e alla successiva — utile a metà fase, per non perdere il filo.' },
          { nome: 'Quiz finale', testo: 'Il più severo: usalo solo alla fine, come vero test prima di considerare la fase completata.' },
        ].map((p, i) => (
          <div key={i} className="bg-paper border border-navy/10 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-navy/60 mb-1">{i + 1}. {p.nome}</p>
            <p className="text-sm text-ink/70">{p.testo}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'correggi-presto',
    titolo: 'Consiglio: correggi presto',
    contenuto: (
      <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 text-sm text-navy">
        <p className="mb-2">
          Se una fase ti sembra troppo facile o troppo difficile, usa i pulsanti <strong>"Troppo facile" / "Troppo difficile"</strong> il prima possibile — idealmente entro le prime 1-2 settimane di quella fase.
        </p>
        <p>
          Più aspetti, più il resto del piano si è già costruito su quel livello di difficoltà: correggere presto evita di dover rifare parti già studiate.
        </p>
      </div>
    ),
  },
  {
    id: 'faq',
    titolo: 'Domande frequenti',
    contenuto: (
      <FAQAccordion />
    ),
  },
];

function FAQAccordion() {
  const [aperta, setAperta] = useState(null);
  const domande = [
    { d: 'Posso cambiare idea sull\'ambito dopo aver generato il piano?', r: 'Sì — torna in home e crea un "Nuovo piano". Il vecchio resta salvato, non viene sovrascritto.' },
    { d: 'Il piano si salva se chiudo l\'app?', r: 'Sì, si salva automaticamente ad ogni passo (durata, fasi, audit) — puoi riprenderlo da "Riprendi da dove eri" in home.' },
    { d: 'Perché a volte vedo "Fonte non trovata"?', r: 'È un comportamento voluto: se l\'AI non trova una fonte affidabile, lo dichiara onestamente invece di inventarla — non è un errore.' },
    { d: 'Cosa significano i colori dei tag (Verificato/Dedotto/Assunto)?', r: 'Verificato = da una fonte reale trovata in quella ricerca. Dedotto = conclusione logica, non da una fonte diretta. Assunto = ipotesi dichiarata, da verificare tu.' },
    { d: 'Cosa fare se una fonte non mi convince?', r: '"Rigenera" chiede all\'AI di trovarne una diversa. "Segnala" registra il problema senza cambiare nulla — usalo se vuoi solo tenerne traccia.' },
  ];

  return (
    <div className="space-y-2">
      {domande.map((item, i) => (
        <div key={i} className="border border-navy/10 rounded-xl overflow-hidden">
          <button
            className="w-full text-left px-4 py-3 text-sm font-medium text-navy flex justify-between items-center"
            onClick={() => setAperta(aperta === i ? null : i)}
          >
            {item.d}
            <span className="text-navy/40 ml-2">{aperta === i ? '−' : '+'}</span>
          </button>
          {aperta === i && (
            <div className="px-4 pb-3 text-sm text-ink/70">{item.r}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Guida({ onClose }) {
  const { t } = useLingua();
  const [sezioneAperta, setSezioneAperta] = useState(SEZIONI[0].id);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-display text-xl text-navy">{t('guida')}</span>
          <button className="btn-secondary text-sm" onClick={onClose}>{t('indietro')}</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {SEZIONI.map((s) => (
            <div key={s.id} className="border border-navy/15 rounded-2xl bg-white overflow-hidden">
              <button
                className="w-full text-left p-5 flex items-center justify-between"
                onClick={() => setSezioneAperta(sezioneAperta === s.id ? null : s.id)}
              >
                <h3 className="font-display text-lg text-navy">{s.titolo}</h3>
                <span className="text-navy text-xl">{sezioneAperta === s.id ? '−' : '+'}</span>
              </button>
              {sezioneAperta === s.id && (
                <div className="px-5 pb-5 border-t border-navy/10 pt-5">
                  {s.contenuto}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
