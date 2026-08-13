export default function PianiPrezzi({ onClose }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-navy">Piani e prezzi</h2>
          <button className="btn-secondary text-sm" onClick={onClose}>Chiudi</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 text-sm text-navy mb-10">
          Questa pagina è solo un'anteprima visiva — nessun pagamento è ancora collegato. Serve per vedere come apparirebbero i piani prima di attivarli davvero.
        </div>

        {/* Abbonamenti */}
        <h3 className="font-display text-2xl text-navy mb-4">Abbonamenti</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <PianoCard
            nome="Free"
            prezzo="€0"
            periodo=""
            caratteristiche={[
              '1 piano al mese',
              'Audit, PDF, ascolto vocale',
              'Funzioni base incluse',
            ]}
          />
          <PianoCard
            nome="Pro"
            prezzo="€12"
            periodo="/mese"
            prezzoAnnuale="oppure €120/anno (2 mesi gratis)"
            evidenziato
            caratteristiche={[
              '5 piani al mese',
              'Rigenera fonte, adatta difficoltà',
              'Tutto il piano Free incluso',
            ]}
          />
          <PianoCard
            nome="Premium"
            prezzo="€20,99"
            periodo="/mese"
            prezzoAnnuale="oppure €209,90/anno (2 mesi gratis)"
            caratteristiche={[
              '12 piani al mese',
              'Spiegazioni AI, traduzione, import CV',
              'Tutto il piano Pro incluso',
            ]}
          />
        </div>

        {/* Shop — acquisto singolo */}
        <h3 className="font-display text-2xl text-navy mb-2">Shop — acquisto singolo</h3>
        <p className="text-sm text-ink/60 mb-4">
          Ti serve solo un piano in più questo mese, senza abbonarti? Comprane uno alla volta.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <PianoCard
            nome="Piano singolo — Pro"
            prezzo="€3,99"
            periodo="una tantum"
            caratteristiche={[
              'Un piano completo con qualità Pro',
              'Rigenera fonte, adatta difficoltà incluse',
              'Nessun impegno, nessun rinnovo',
            ]}
          />
          <PianoCard
            nome="Piano singolo — Premium"
            prezzo="€6,99"
            periodo="una tantum"
            caratteristiche={[
              'Un piano completo con tutte le funzioni',
              'Spiegazioni, traduzione, import CV incluse',
              'Nessun impegno, nessun rinnovo',
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function PianoCard({ nome, prezzo, periodo, prezzoAnnuale, caratteristiche, evidenziato }) {
  return (
    <div className={`rounded-2xl p-6 border-2 ${evidenziato ? 'border-navy bg-navy text-paper' : 'border-navy/15 bg-white'}`}>
      <h4 className="font-display text-lg mb-1">{nome}</h4>
      <p className="font-display text-3xl mb-1">
        {prezzo}
        <span className={`text-sm font-body ${evidenziato ? 'opacity-70' : 'text-ink/50'}`}> {periodo}</span>
      </p>
      {prezzoAnnuale && (
        <p className={`text-xs mb-4 ${evidenziato ? 'opacity-70' : 'text-ink/50'}`}>{prezzoAnnuale}</p>
      )}
      <ul className={`text-sm space-y-2 mb-6 ${!prezzoAnnuale ? 'mt-4' : ''}`}>
        {caratteristiche.map((c, i) => (
          <li key={i} className="flex gap-2">
            <span>✓</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
      <button
        disabled
        className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-60 ${
          evidenziato ? 'bg-paper text-navy' : 'bg-navy/10 text-navy'
        }`}
      >
        Prossimamente
      </button>
    </div>
  );
}
