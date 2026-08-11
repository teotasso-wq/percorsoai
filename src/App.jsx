import { useState } from 'react';
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(FORM_INIZIALE);
  const [durata, setDurata] = useState(null);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-navy/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold text-sm">
            P
          </div>
          <span className="font-display text-xl text-navy">PercorsoAI</span>
        </div>
      </header>

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
            onNext={(d) => {
              setDurata(d);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Plan
            formData={formData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && <Step4Audit onBack={() => setStep(3)} />}
      </main>
    </div>
  );
}
