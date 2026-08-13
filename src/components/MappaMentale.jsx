export default function MappaMentale({ planData, ambito, onClose }) {
  return (
    <div className="fixed inset-0 bg-paper z-50 overflow-auto">
      <div className="flex justify-between items-center p-6 border-b border-navy/10 bg-white sticky top-0">
        <h2 className="font-display text-lg text-navy">Mappa del percorso</h2>
        <button className="btn-secondary text-sm" onClick={onClose}>Chiudi</button>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="bg-navy text-paper rounded-2xl px-6 py-4 font-display text-lg text-center mb-2 max-w-xs">
          {ambito}
        </div>
        <div className="w-0.5 h-8 bg-navy/20" />

        <div className="space-y-0 w-full max-w-md">
          {planData.phases.map((fase, i) => (
            <div key={fase.id} className="flex flex-col items-center">
              <div className="bg-white border-2 border-navy/30 rounded-2xl px-5 py-4 w-full text-center">
                <p className="text-xs text-navy/50 mb-1">Fase {i + 1}</p>
                <p className="font-display text-navy">{fase.titolo}</p>
              </div>
              {i < planData.phases.length - 1 && <div className="w-0.5 h-8 bg-navy/20" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
