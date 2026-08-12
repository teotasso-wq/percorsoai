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

  useEffect(() => {
    if (sessione && !localStorage.getItem('percorsoai_tutorial_visto')) {
      setMostraTutorial(true);
    }
  }, [sessione]);

  const chiudiTutorial = () => {
    localStorage.setItem('percorsoai_tutorial_visto', '1');
    setMostraTutorial(false);
  };

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
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button className="flex items-center gap-3" onClick={() => setVista('lista')}>
            <div className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold text-sm">
              P
            </div>
            <span className="font-display text-xl text-navy">{t('app_nome')}</span>
          </button>
          <div className="flex items-center gap-4">
            {streak !== null && streak > 0 && (
              <span className="text-sm font-semibold text-dedotto">🔥 {streak} {streak === 1 ? 'giorno' : 'giorni'}</span>
            )}
            <button className="text-sm text-navy/60 underline" onClick={() => setMostraGuida(true)}>
              {t('guida')}
            </button>
            <button className="text-sm text-navy/60 underline" onClick={() => setVista('statistiche')}>
              Statistiche
            </button>
            <button className="text-sm text-navy/60 underline" onClick={() => setVista('impostazioni')}>
              Impostazioni
            </button>
            <button className="text-sm text-navy/60 underline" onClick={() => supabase.auth.signOut()}>
              {t('esci')}
            </button>
          </div>
        </div>
      </header>

      {vista === 'lista' && (
        <MyPlans onOpen={apriPianoSalvato} onNewPlan={iniziaNuovoPiano} />
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
