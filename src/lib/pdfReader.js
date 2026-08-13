// Legge un file PDF caricato dall'utente e restituisce il testo estratto.
// La libreria pesante (pdfjs) viene caricata solo quando questa funzione
// viene chiamata davvero (import dinamico), non ad ogni apertura dello
// Step 1 — riduce il peso iniziale della pagina per chi non carica un CV.
export async function estraiTestoDaPdf(file) {
  const pdfjsLib = await import('pdfjs-dist');
  const pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let testoCompleto = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pagina = await pdf.getPage(i);
    const contenuto = await pagina.getTextContent();
    const testoPagina = contenuto.items.map((item) => item.str).join(' ');
    testoCompleto += testoPagina + '\n';
  }

  return testoCompleto.trim();
}
