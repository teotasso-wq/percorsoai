import { useLingua } from '../lib/LinguaContext';

const STYLES = {
  verificato: 'bg-verificato/10 text-verificato border-verificato/30',
  dedotto: 'bg-dedotto/10 text-dedotto border-dedotto/30',
  assunto: 'bg-assunto/10 text-assunto border-assunto/30',
  non_trovata: 'bg-nonTrovata/10 text-nonTrovata border-nonTrovata/30',
};

const CHIAVI_LABEL = {
  verificato: 'badge_verificato',
  dedotto: 'badge_dedotto',
  assunto: 'badge_assunto',
  non_trovata: 'badge_non_trovata',
};

export default function Badge({ type = 'assunto' }) {
  const { t } = useLingua();
  return (
    <span
      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${STYLES[type]}`}
    >
      {t(CHIAVI_LABEL[type])}
    </span>
  );
}
