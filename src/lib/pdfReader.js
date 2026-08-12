import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Legge un file PDF caricato dall'utente e restituisce il testo estratto.
export async function estraiTestoDaPdf(file) {
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
