// Questo file parla con la funzione "genera-piano" su Supabase.
// Le due variabili sotto arrivano dalle impostazioni di Vercel
// (le aggiungiamo nel prossimo passo della guida).

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function chiamaFunzione(payload) {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Errore nella generazione');
  }
  return data;
}

export function generaDurate(formData) {
  return chiamaFunzione({ stage: 'duration', formData });
}

export function generaPiano(formData, duration) {
  return chiamaFunzione({ stage: 'plan', formData, duration });
}

export function generaAudit(formData, planData) {
  return chiamaFunzione({ stage: 'audit', formData, duration: planData });
}

export function generaSpiegazione(formData, phase) {
  return chiamaFunzione({ stage: 'explanation', formData, duration: phase });
}

export function rigeneraFonte(formData, fonte) {
  return chiamaFunzione({ stage: 'regenera_fonte', formData, duration: fonte });
}

export function rigeneraFase(formData, fase, direzione) {
  return chiamaFunzione({ stage: 'rigenera_fase', formData, duration: { fase, direzione } });
}

export function suggerisciProssimoPiano(pianiCompletati) {
  return chiamaFunzione({
    stage: 'suggerisci_prossimo',
    formData: { ambito: '', obiettivo: '', livello: '', oreSettimanali: '', criterioSuccesso: '' },
    duration: pianiCompletati,
  });
}
