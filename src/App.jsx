import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import MyPlans from './components/MyPlans';
import Stepper from './components/Stepper';
import Step1Form from './components/Step1Form';
import Step2Duration from './components/Step2Duration';
import Step3Plan from './components/Step3Plan';
import Step4Audit from './components/Step4Audit';

const FORM_INIZIALE = {
  ambito: '',
  obiettivo: '',
  livello: 'principiante',
  oreSettimanali: 6,
  criterioSuccesso: '',
};

export default function App() {
  const [sessione, setSessione] = useState(undefined); // undefined = ancora in caricamento
  const [vista, setVista] = useState('lista'); // 'lista' | 'percorso'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(FORM_INIZIALE);
  const [durata, setDurata] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [pianoIdCorrente, setPianoIdCorrente] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessione(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessione(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const iniziaNuovoPiano = () => {
    setFormData(FORM_INIZIALE);
    setDurata(null);
    setPlanData(null);
    setAuditData(null);
    setPianoIdCorrente(null);
    setStep(1);
    setVista('percorso');
  };

  const apriPianoSalvato = (p) => {
    setFormData(p.form_data);
    setDurata(p.duration_data);
    setPlanData(p.plan_data);
    setAuditData(p.audit_data);
    setPianoIdCorrente(p.id);
    setStep(4);
    setVista('percorso');
  };

  const salvaPiano = async (audit) => {
    const userId = sessione?.user?.id;
    if (!userId) return;
    const riga = {
      user_id: userId,
      form_data: formData,
      duration_data: durata,
      plan_data: planData,
      audit_data: audit,
    };
    if (pianoIdCorrente) {
      await supabase.from('piani').update(riga).eq('id', pianoIdCorrente);
    } else {
      const { data } = await supabase.from('piani').insert(riga).select().single();
      if (data) setPianoIdCorrente(data.id);
    }
  };

  if (sessione === undefined) {
    return <div className="min-h-screen bg-paper" />; // caricamento silenzioso
  }

  if (!sessione) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button className="flex items-center gap-3" onClick={() => setVista('lista')}>
            <div className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold text-sm">
              P
            </div>
            <span className="font-display text-xl text-navy">PercorsoAI</span>
          </button>
          <button
            className="text-sm text-navy/60 underline"
            onClick={() => supabase.auth.signOut()}
          >
            Esci
          </button>
        </div>
      </header>

      {vista === 'lista' && (
        <MyPlans onOpen={apriPianoSalvato} onNewPlan={iniziaNuovoPiano} />
      )}

      {vista === 'percorso' && (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <Stepper current={step} />

          {step === 1 && (
            <Step1Form
              data={formData}
              onNext={(data) => {
                setFormData(data);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <Step2Duration
              selected={durata}
              formData={formData}
              onNext={(d) => {
                setDurata(d);
                setPlanData(null);
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
              onPlanReady={setPlanData}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <Step4Audit
              formData={formData}
              planData={planData}
              auditDataIniziale={auditData}
              onAuditReady={(audit) => {
                setAuditData(audit);
                salvaPiano(audit);
              }}
              onBack={() => setStep(3)}
            />
          )}
        </main>
      )}
    </div>
  );
}
