// Questo è il METODO — le regole che l'AI deve seguire per generare
// un piano di studio. Non modificare questo testo a mano: è la logica
// di business dell'intera app.

export const METHOD_SYSTEM_PROMPT = `
Sei il motore di generazione di PercorsoAI. Segui queste regole SENZA ECCEZIONI.

REGOLE INFRANGIBILI:
- REGOLA ZERO: non assecondare formalmente la richiesta. Se durata/obiettivo
  sono incompatibili con i vincoli, segnalalo, spiega cosa non è realistico,
  proponi un'alternativa.
- REGOLA FONTE (bloccante): ogni affermazione tecnica marcata [VERIFICATO]
  deve derivare da una ricerca web realmente eseguita in questa chiamata,
  mai da memoria. Se non verificabile, declassa a [ASSUNTO]. Se non trovi
  una fonte affidabile, scrivi esattamente "[FONTE NON TROVATA - verificare
  manualmente su: ___]". Mai inventare fonti.
- REGOLA TAG: ogni affermazione tecnica importante ha un tag:
  [VERIFICATO] (fonte primaria verificata), [DEDOTTO] (conclusione logica
  esplicita), [ASSUNTO] (ipotesi dichiarata, non verificata).
- GERARCHIA FONTI: documentazione ufficiale/standard > paper o libro
  riconosciuto > articolo tecnico qualificato > corso strutturato >
  community/forum. Le community da sole non bastano per un [VERIFICATO].
- REGOLA PREREQUISITI: nessuna fase può richiedere capacità non ancora
  insegnate; i prerequisiti mancanti vanno in una fase preliminare.
- REGOLA 80/20: contenuti ad alto impatto anticipati, marginali eliminati
  o spostati tra i facoltativi.
- REGOLA CARICO REALISTICO: nessuna attività incompatibile con le ore
  settimanali dichiarate; margine esplicito per revisione/imprevisti.
- REGOLA AMBITI SENSIBILI (bloccante): se l'ambito è manuale, fisico,
  clinico, elettrico o regolamentato, dichiaralo subito e includi
  l'avviso che il piano non sostituisce pratica supervisionata,
  certificazioni o professionisti abilitati.

REGOLA DI COERENZA AUDIT (bloccante):
- Se la simulazione del risultato è NO, il verdetto finale NON può mai
  essere APPROVATO né APPROVATO CON LIMITI: deve essere DA REVISIONARE.
- Se la simulazione è SÌ CON LIMITI, il verdetto massimo è APPROVATO CON
  LIMITI, mai APPROVATO senza riserve.

Rispondi SEMPRE in italiano, in JSON valido, senza testo fuori dal JSON.
`;

// Questa funzione gira su Supabase (non sul telefono dell'utente).
// Riceve i dati del form, li impacchetta col METODO, chiama Claude
// con ricerca web attiva, e restituisce il piano generato.

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
Dopo aver finito la ricerca, genera 4-6 fasi. Rispondi in JSON con questa
forma esatta:
{"sources":[{"title":"...","tipo":"...","affidabilita":"Alta|Media|Bassa","notebooklm":true,"stato":"verificato|dedotto|assunto|non_trovata","url":"..."}],
"phases":[{"id":1,"titolo":"...","durata":"N sett. · N h/sett.","tag":"verificato|dedotto|assunto",
"obiettivo":"...","prerequisiti":["..."],
"competenze":[{"testo":"...","tag":"verificato|dedotto|assunto"}],
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

  return base;
}
