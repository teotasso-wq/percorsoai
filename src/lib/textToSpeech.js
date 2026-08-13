// Usa la sintesi vocale già integrata nel browser — nessun servizio
// esterno, nessuna chiave, nessun costo.

export function leggiPianoAdAltaVoce(planData, ambito, codiceVocale = 'it-IT') {
  if (!('speechSynthesis' in window)) {
    throw new Error('Il tuo browser non supporta la lettura vocale.');
  }

  window.speechSynthesis.cancel(); // interrompe eventuali letture precedenti

  const testo = costruisciTestoDaLeggere(planData, ambito);
  parlaFrasi(testo, codiceVocale);
}

// Onda L, idea 29: legge ad alta voce solo la fase indicata, non
// l'intero piano — utile per ripassare mentre si cammina o si guida.
export function leggiFaseAdAltaVoce(fase, codiceVocale = 'it-IT') {
  if (!('speechSynthesis' in window)) {
    throw new Error('Il tuo browser non supporta la lettura vocale.');
  }
  window.speechSynthesis.cancel();

  let testo = `${fase.titolo}. ${fase.obiettivo} `;
  fase.competenze.forEach((c) => {
    testo += `${c.testo}. `;
  });
  parlaFrasi(testo, codiceVocale);
}

function parlaFrasi(testo, codiceVocale) {
  const frasi = testo.split(/(?<=[.!?])\s+/).filter(Boolean);
  const voci = window.speechSynthesis.getVoices();
  const voceScelta =
    voci.find((v) => v.lang === codiceVocale) ||
    voci.find((v) => v.lang.startsWith(codiceVocale.split('-')[0]));

  frasi.forEach((frase) => {
    const enunciato = new SpeechSynthesisUtterance(frase);
    enunciato.lang = codiceVocale;
    if (voceScelta) enunciato.voice = voceScelta;
    enunciato.rate = 0.95;
    window.speechSynthesis.speak(enunciato);
  });
}

export function fermaLetturaVocale() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function costruisciTestoDaLeggere(planData, ambito) {
  let testo = `${ambito}. `;
  planData.phases.forEach((fase, i) => {
    testo += `${fase.titolo}. ${fase.obiettivo} `;
  });
  return testo;
}
