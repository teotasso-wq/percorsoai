import { useState } from 'react';
import { useLingua } from '../lib/LinguaContext';

export default function CopyButton({ text }) {
  const { t } = useLingua();
  const [copiato, setCopiato] = useState(false);

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1500);
    } catch {
      // Silenzioso: alcuni browser richiedono HTTPS per la clipboard
    }
  };

  return (
    <button
      onClick={copia}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-navy/20 text-navy hover:bg-navy hover:text-paper transition-colors"
    >
      {copiato ? t('copiato') : t('copia')}
    </button>
  );
}
