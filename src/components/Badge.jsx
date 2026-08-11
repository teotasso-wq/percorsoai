const STYLES = {
  verificato: 'bg-verificato/10 text-verificato border-verificato/30',
  dedotto: 'bg-dedotto/10 text-dedotto border-dedotto/30',
  assunto: 'bg-assunto/10 text-assunto border-assunto/30',
  non_trovata: 'bg-nonTrovata/10 text-nonTrovata border-nonTrovata/30',
};

const LABELS = {
  verificato: 'Verificato',
  dedotto: 'Dedotto',
  assunto: 'Assunto',
  non_trovata: 'Fonte non trovata',
};

export default function Badge({ type = 'assunto' }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
