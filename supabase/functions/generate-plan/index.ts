// Questa funzione gira su Supabase (non sul telefono dell'utente).
// Riceve i dati del form, li impacchetta col METODO, chiama Claude
// con ricerca web attiva, e restituisce il piano generato.

import { METHOD_SYSTEM_PROMPT } from "../_shared/method.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { stage, formData, duration } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("Chiave AI non configurata nei segreti Supabase.");
    }

    const userPrompt = buildUserPrompt(stage, formData, duration);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system: METHOD_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Errore AI (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    const parsed = extractJSON(data);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});

// Estrae il JSON dalla risposta dell'AI in modo resistente:
// prende TUTTI i blocchi di testo (non solo l'ultimo), li unisce,
// poi isola solo la parte tra la prima { e l'ultima } — ignorando
// qualunque cosa l'AI abbia scritto prima o dopo (blocchi ```json,
// commenti, spiegazioni), che è la causa più comune di errore.
function extractJSON(data) {
  const textBlocks = (data.content || []).filter((b) => b.type === "text");

  if (textBlocks.length === 0) {
    throw new Error("L'AI non ha restituito testo. Risposta grezza: " + JSON.stringify(data).slice(0, 500));
  }

  const fullText = textBlocks.map((b) => b.text).join("\n");

  const start = fullText.indexOf("{");
  const end = fullText.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Nessun JSON trovato nella risposta. Testo ricevuto: " + fullText.slice(0, 500));
  }

  const candidate = fullText.slice(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch (e) {
    throw new Error(
      "JSON non valido dopo l'estrazione: " + e.message +
      " | Anteprima: " + candidate.slice(0, 300)
    );
  }
}

function buildUserPrompt(stage, formData, duration) {
  const base = `
Dati raccolti dall'utente:
- Ambito: ${formData.ambito}
- Obiettivo operativo: ${formData.obiettivo}
- Livello di partenza: ${formData.livello}
- Ore disponibili a settimana: ${formData.oreSettimanali}
- Criterio di successo: ${formData.criterioSuccesso}
`;

  const formatWarning = `
IMPORTANTE SUL FORMATO DELLA RISPOSTA:
- Rispondi SOLO con l'oggetto JSON richiesto, niente altro.
- NON usare blocchi di codice markdown (niente \`\`\`json, niente \`\`\`).
- NON aggiungere commenti, spiegazioni o testo prima o dopo il JSON.
- La tua risposta deve iniziare direttamente con { e finire con }.
`;

  if (stage === "duration") {
    return `${base}${formatWarning}
Genera 3 proposte di durata (minima realistica, consigliata, comoda) in
settimane, con una breve nota per ciascuna. Rispondi in JSON con questa
forma esatta:
{"durations":[{"id":"minima","label":"Minima realistica","weeks":N,"note":"..."},
{"id":"consigliata","label":"Consigliata","weeks":N,"note":"..."},
{"id":"comoda","label":"Comoda","weeks":N,"note":"..."}]}`;
  }

  if (stage === "plan") {
    return `${base}
Durata scelta: ${duration.weeks} settimane.
Fai una ricerca web reale per trovare 3-5 fonti affidabili sull'ambito.
${formatWarning}
Dopo aver finito la ricerca, genera 4-6 fasi. Per ogni competenza,
classifica anche se va imparata a memoria (tipo_memoria: "memoria",
per basi che servono sempre pronte) o se basta saper consultare una
fonte quando serve (tipo_memoria: "consultabile", per dettagli tecnici
che si cercano al momento). Rispondi in JSON con questa forma esatta:
{"sources":[{"title":"...","tipo":"...","affidabilita":"Alta|Media|Bassa","notebooklm":true,"stato":"verificato|dedotto|assunto|non_trovata","url":"..."}],
"phases":[{"id":1,"titolo":"...","durata":"N sett. · N h/sett.","tag":"verificato|dedotto|assunto",
"obiettivo":"...","prerequisiti":["..."],
"competenze":[{"testo":"...","tag":"verificato|dedotto|assunto","tipo_memoria":"memoria|consultabile"}],
"criterio":"...","portfolio":"..."}]}`;
  }

  if (stage === "audit") {
    return `${base}${formatWarning}
Esegui l'audit del piano allegato: ${JSON.stringify(duration)}.
Applica la REGOLA DI COERENZA AUDIT. Rispondi in JSON con questa forma
esatta:
{"simulazione":"SÌ|SÌ CON LIMITI|NO","spiegazione":"...",
"kpi":{"Completezza":N,"Copertura prerequisiti":N,"Progressione didattica":N,
"Coerenza carico-tempo":N,"Qualità fonti":N,"Rapporto teoria-pratica":N},
"rischio":"Basso|Medio|Alto","verdetto":"APPROVATO|APPROVATO CON LIMITI|DA REVISIONARE"}`;
  }

  if (stage === "explanation") {
    return `${base}${formatWarning}
Genera la spiegazione discorsiva della seguente fase del percorso, a
livello adatto al livello di partenza dichiarato, con almeno un esempio
pratico per ogni competenza elencata:

Fase: ${duration.titolo}
Obiettivo: ${duration.obiettivo}
Competenze da spiegare: ${duration.competenze.map((c) => c.testo).join('; ')}

Scrivi 3-5 paragrafi (in totale circa 400-600 parole). Rispondi in JSON
con questa forma esatta:
{"paragrafi":[{"testo":"...","tag":"verificato|dedotto|assunto"}]}`;
  }

  if (stage === "regenera_fonte") {
    return `${base}${formatWarning}
La fonte seguente è stata segnalata come non valida o non pertinente,
trova una fonte alternativa reale con una ricerca web:

Fonte da sostituire: ${duration.title} (${duration.tipo})

Rispondi in JSON con questa forma esatta, con la nuova fonte:
{"title":"...","tipo":"...","affidabilita":"Alta|Media|Bassa","notebooklm":true,"stato":"verificato|dedotto|assunto|non_trovata","url":"..."}`;
  }

  if (stage === "rigenera_fase") {
    return `${base}${formatWarning}
La fase seguente è stata segnalata come "${duration.direzione}" dall'utente.
Rigenera SOLO questa fase, adattando carico e profondità di conseguenza
(se troppo facile: alza la difficoltà e aggiungi contenuti; se troppo
difficile: semplifica, spezza in passaggi più piccoli, aggiungi più
tempo). Mantieni lo stesso id e lo stesso ordine logico nel percorso.

Fase originale: ${JSON.stringify(duration.fase)}

Rispondi in JSON con questa forma esatta (una sola fase):
{"id":${duration.fase.id},"titolo":"...","durata":"N sett. · N h/sett.","tag":"verificato|dedotto|assunto",
"obiettivo":"...","prerequisiti":["..."],
"competenze":[{"testo":"...","tag":"verificato|dedotto|assunto","tipo_memoria":"memoria|consultabile"}],
"criterio":"...","portfolio":"..."}`;
  }

  if (stage === "suggerisci_prossimo") {
    return `
L'utente ha già completato questi percorsi di studio:
${duration.map((p) => `- ${p.ambito}: ${p.obiettivo}`).join('\n')}
${formatWarning}
Suggerisci UN possibile prossimo percorso coerente con questi già
completati (una progressione naturale, non una ripetizione). Rispondi
in JSON con questa forma esatta:
{"ambito":"...","obiettivo":"...","motivazione":"perché ha senso come prossimo passo, 1-2 frasi"}`;
  }

  return base;
}
