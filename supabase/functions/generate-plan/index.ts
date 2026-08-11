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
        max_tokens: 4000,
        system: METHOD_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Errore AI: ${errText}`);
    }

    const data = await response.json();
    const textBlock = data.content.find((b) => b.type === "text");
    const parsed = JSON.parse(textBlock?.text ?? "{}");

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

function buildUserPrompt(stage, formData, duration) {
  const base = `
Dati raccolti dall'utente:
- Ambito: ${formData.ambito}
- Obiettivo operativo: ${formData.obiettivo}
- Livello di partenza: ${formData.livello}
- Ore disponibili a settimana: ${formData.oreSettimanali}
- Criterio di successo: ${formData.criterioSuccesso}
`;

  if (stage === "duration") {
    return `${base}
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
Poi genera 4-6 fasi. Rispondi in JSON con questa forma esatta:
{"sources":[{"title":"...","tipo":"...","affidabilita":"Alta|Media|Bassa","notebooklm":true,"stato":"verificato|dedotto|assunto|non_trovata","url":"..."}],
"phases":[{"id":1,"titolo":"...","durata":"N sett. · N h/sett.","tag":"verificato|dedotto|assunto",
"obiettivo":"...","prerequisiti":["..."],
"competenze":[{"testo":"...","tag":"verificato|dedotto|assunto"}],
"criterio":"...","portfolio":"..."}]}`;
  }

  if (stage === "audit") {
    return `${base}
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
