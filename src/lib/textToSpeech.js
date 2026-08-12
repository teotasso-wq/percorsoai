// Usa la sintesi vocale già integrata nel browser — nessun servizio
// esterno, nessuna chiave, nessun costo.

export function leggiPianoAdAltaVoce(planData, ambito) {
  if (!('speechSynthesis' in window)) {
    throw new Error('Il tuo browser non supporta la lettura vocale.');
  }

  window.speechSynthesis.cancel(); // interrompe eventuali letture precedenti

  const testo = costruisciTestoDaLeggere(planData, ambito);
  const frasi = testo.split(/(?<=[.!?])\s+/).filter(Boolean);

  frasi.forEach((frase) => {
    const enunciato = new SpeechSynthesisUtterance(frase);
    enunciato.lang = 'it-IT';
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
  let testo = `Piano di studio per: ${ambito}. `;
  planData.phases.forEach((fase, i) => {
    testo += `Fase ${i + 1}: ${fase.titolo}. ${fase.obiettivo} `;
    testo += `Durata: ${fase.durata}. `;
  });
  return testo;
}
