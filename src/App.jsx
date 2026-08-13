import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { aggiornaStreak } from './lib/streak';
import Login from './components/Login';
import MyPlans from './components/MyPlans';
import Tutorial from './components/Tutorial';
import Stats from './components/Stats';
import Settings from './components/Settings';
import Stepper from './components/Stepper';
import Step1Form from './components/Step1Form';
import Step2Duration from './components/Step2Duration';
import Step3Plan from './components/Step3Plan';
import Step4Audit from './components/Step4Audit';
import PrintPianoCompleto from './components/PrintPianoCompleto';
import PrintPortfolio from './components/PrintPortfolio';
import Guida from './components/Guida';
import { useLingua } from './lib/LinguaContext';
import { DEMO_PHASES, DEMO_SOURCES, DEMO_AUDIT } from './data/demoPlan';

const FORM_INIZIALE = {
  ambito: '',
  obiettivo: '',
  livello: 'principiante',
  oreSettimanali: 6,
  criterioSuccesso: '',
};

export default function App() {
  const { t } = useLingua();
  const [sessione, setSessione] = useState(undefined);
  const [vista, setVista] = useState('lista'); // lista | percorso | stampa-piano | stampa-portfolio
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(FORM_INIZIALE);
  const [durata, setDurata] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [pianoIdCorrente, setPianoIdCorrente] = useState(null);
  const [pianoSalvato, setPianoSalvato] = useState(null);
  const [streak, setStreak] = useState(null);
  const [mostraTutorial, setMostraTutorial] = useState(false);
  const [mostraGuida, setMostraGuida] = useState(false);
  const [menuAperto, setMenuAperto] = useState(false);
  const [mostraPromemoriaPausa, setMostraPromemoriaPausa] = useState(false);

  // Onda G, idea 174: dopo una sessione lunga, un avviso gentile —
  // nessuna chiamata AI, solo un timer locale.
  useEffect(() => {
    const timer = setTimeout(() => setMostraPromemoriaPausa(true), 45 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sessione && !localStorage.getItem('percorsoai_tutorial_visto')) {
      setMostraTutorial(true);
    }
  }, [sessione]);

  const chiudiTutorial = () => {
    localStorage.setItem('percorsoai_tutorial_visto', '1');
    setMostraTutorial(false);
  };

  // Onda F, idea 128: al primissimo accesso (nessun piano ancora),
  // crea un piano di esempio già pronto nella cronologia, così la
  // home non è mai vuota per un nuovo utente. Usa dati statici, nessuna
  // chiamata AI.
  useEffect(() => {
    const creaPianoEsempioSeNecessario = async () => {
      const userId = sessione?.user?.id;
      if (!userId) return;
      const { count } = await supabase
        .from('piani')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (count === 0) {
        await supabase.from('piani').insert({
          user_id: userId,
          form_data: { ambito: 'Progettista meccanico (esempio)', obiettivo: 'Vedere come appare un piano completo, con fasi, fonti e audit finale.' },
          duration_data: { weeks: 10 },
          plan_data: { phases: DEMO_PHASES, sources: DEMO_SOURCES },
          audit_data: DEMO_AUDIT,
          status: 'completato',
          esempio: true,
        });
      }
    };
    if (sessione?.user?.id) creaPianoEsempioSeNecessario();
  }, [sessione?.user?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessione(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessione(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessione?.user?.id) {
      aggiornaStreak(sessione.user.id).then(setStreak);
    }
  }, [sessione?.user?.id]);

  const iniziaNuovoPiano = async (precompilato) => {
    const userId = sessione?.user?.id;
    setFormData(precompilato ? { ...FORM_INIZIALE, ...precompilato } : FORM_INIZIALE);
    setDurata(null);
    setPlanData(null);
    setAuditData(null);
    setPianoIdCorrente(null);
    setPianoSalvato(null);
    setStep(1);
    setVista('percorso');
  };

  const apriPianoSalvato = (p) => {
    setFormData(p.form_data);
    setDurata(p.duration_data);
    setPlanData(p.plan_data);
    setAuditData(p.audit_data);
    setPianoIdCorrente(p.id);
    setPianoSalvato(p);
    // Riprende dal punto giusto in base a cosa è già stato generato
    if (p.audit_data) setStep(4);
    else if (p.plan_data) setStep(3);
    else if (p.duration_data) setStep(2);
    else setStep(1);
    setVista('percorso');
  };

  // Salva/aggiorna il piano nel database ad ogni passo, non solo alla fine.
  const salvaProgresso = async (campi, status) => {
    const userId = sessione?.user?.id;
    if (!userId) return;
    const riga = {
      user_id: userId,
      form_data: formData,
      updated_at: new Date().toISOString(),
      status,
      ...campi,
    };
    if (pianoIdCorrente) {
      const { data } = await supabase.from('piani').update(riga).eq('id', pianoIdCorrente).select().single();
      if (data) setPianoSalvato(data);
    } else {
      const { data } = await supabase.from('piani').insert(riga).select().single();
      if (data) {
        setPianoIdCorrente(data.id);
        setPianoSalvato(data);
      }
    }
  };

  const salvaObiettivoSettimanale = async (campi) => {
    if (!pianoIdCorrente) return;
    const { data } = await supabase.from('piani').update(campi).eq('id', pianoIdCorrente).select().single();
    if (data) setPianoSalvato(data);
  };

  const salvaSegnalazione = async (segnalazione) => {
    if (!pianoIdCorrente) return;
    const segnalazioniAttuali = pianoSalvato?.segnalazioni || [];
    const nuoveSegnalazioni = [...segnalazioniAttuali, segnalazione];
    const { data } = await supabase
      .from('piani')
      .update({ segnalazioni: nuoveSegnalazioni })
      .eq('id', pianoIdCorrente)
      .select()
      .single();
    if (data) setPianoSalvato(data);
  };

  if (sessione === undefined) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!sessione) {
    return <Login />;
  }

  if (vista === 'stampa-piano') {
    return (
      <PrintPianoCompleto
        formData={formData}
        durata={durata}
        planData={planData}
        auditData={auditData}
        onClose={() => setVista('percorso')}
      />
    );
  }

  if (vista === 'stampa-portfolio') {
    return (
      <PrintPortfolio
        formData={formData}
        planData={planData}
        onClose={() => setVista('percorso')}
      />
    );
  }

  if (mostraGuida) {
    return <Guida onClose={() => setMostraGuida(false)} />;
  }

  return (
    <div className="min-h-screen bg-paper">
      {mostraTutorial && <Tutorial onClose={chiudiTutorial} />}
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-2">
          <button className="flex items-center gap-2 min-w-0" onClick={() => setVista('lista')}>
            <div className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold text-sm shrink-0">
              P
            </div>
            <span className="font-display text-lg text-navy truncate">{t('app_nome')}</span>
            {streak !== null && streak > 0 && (
              <span className="text-xs font-semibold text-dedotto whitespace-nowrap shrink-0">🔥 {streak}</span>
            )}
          </button>

          <div className="relative shrink-0">
            <button
              className="w-9 h-9 flex items-center justify-center text-navy text-xl"
              onClick={() => setMenuAperto(!menuAperto)}
            >
              ☰
            </button>
            {menuAperto && (
              <div className="absolute right-0 top-11 bg-white border border-navy/15 rounded-xl shadow-lg py-2 min-w-[160px] z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-paper"
                  onClick={() => {
                    localStorage.setItem('percorsoai_ha_aperto_guida', '1');
                    setMostraGuida(true);
                    setMenuAperto(false);
                  }}
                >
                  {t('guida')}
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-paper"
                  onClick={() => { setVista('statistiche'); setMenuAperto(false); }}
                >
                  Statistiche
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-paper"
                  onClick={() => { setVista('impostazioni'); setMenuAperto(false); }}
                >
                  Impostazioni
                </button>
                <div className="border-t border-navy/10 my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-nonTrovata hover:bg-paper"
                  onClick={() => supabase.auth.signOut()}
                >
                  {t('esci')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mostraPromemoriaPausa && (
        <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4">
          <div className="bg-dedotto/10 border border-dedotto/30 rounded-xl p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-navy">Stai usando l'app da un po' — magari una pausa? ☕</p>
            <button className="text-xs text-navy/50 underline shrink-0" onClick={() => setMostraPromemoriaPausa(false)}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      {vista === 'lista' && (
        <MyPlans
          onOpen={apriPianoSalvato}
          onNewPlan={iniziaNuovoPiano}
          onApriGuida={() => {
            localStorage.setItem('percorsoai_ha_aperto_guida', '1');
            setMostraGuida(true);
          }}
        />
      )}

      {vista === 'statistiche' && (
        <Stats onClose={() => setVista('lista')} />
      )}

      {vista === 'impostazioni' && (
        <Settings onClose={() => setVista('lista')} />
      )}

      {vista === 'percorso' && (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <Stepper current={step} />

          {step === 1 && (
            <Step1Form
              data={formData}
              onNext={async (data) => {
                setFormData(data);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <Step2Duration
              selected={durata}
              formData={formData}
              onNext={async (d) => {
                setDurata(d);
                setPlanData(null);
                await salvaProgresso({ duration_data: d }, 'bozza');
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Plan
              formData={formData}
              duration={durata}
              planData={planData}
              pianoSalvato={pianoSalvato}
              onSalvaObiettivo={salvaObiettivoSettimanale}
              onSegnala={salvaSegnalazione}
              onPlanReady={async (data) => {
                setPlanData(data);
                await salvaProgresso({ duration_data: durata, plan_data: data }, 'bozza');
              }}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <Step4Audit
              formData={formData}
              planData={planData}
              auditDataIniziale={auditData}
              onAuditReady={async (audit) => {
                setAuditData(audit);
                await salvaProgresso(
                  { duration_data: durata, plan_data: planData, audit_data: audit },
                  'completato'
                );
                localStorage.setItem('percorsoai_ha_generato_piano', '1');
              }}
              onBack={() => setStep(3)}
              onExportPiano={() => setVista('stampa-piano')}
              onExportPortfolio={() => setVista('stampa-portfolio')}
            />
          )}
        </main>
      )}
    </div>
  );
}
