import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLingua } from '../lib/LinguaContext';
import DemoPreview from './DemoPreview';

export default function Login() {
  const { t } = useLingua();
  const [email, setEmail] = useState('');
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState(null);
  const [invio, setInvio] = useState(false);
  const [mostraDemo, setMostraDemo] = useState(false);

  if (mostraDemo) {
    return <DemoPreview onClose={() => setMostraDemo(false)} />;
  }

  const invia = async (e) => {
    e.preventDefault();
    setInvio(true);
    setErrore(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setInvio(false);
    if (error) {
      setErrore(error.message);
    } else {
      setInviato(true);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full border-2 border-navy flex items-center justify-center text-navy font-display font-bold mx-auto mb-3">
            P
          </div>
          <h1 className="font-display text-2xl text-navy">{t('app_nome')}</h1>
        </div>

        {inviato ? (
          <div className="bg-verificato/10 border border-verificato/30 rounded-xl p-5 text-sm text-navy text-center">
            {t('login_inviato')}
          </div>
        ) : (
          <form onSubmit={invia} className="space-y-4">
            <p className="text-sm text-ink/60 text-center mb-2">
              {t('login_titolo')}
            </p>
            <input
              type="email"
              required
              className="input"
              placeholder={t('login_placeholder_email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errore && (
              <p className="text-sm text-nonTrovata">{errore}</p>
            )}
            <button className="btn-primary w-full" disabled={invio}>
              {invio ? t('login_invio_corso') : t('login_invia')}
            </button>
          </form>
        )}

        {!inviato && (
          <button
            className="w-full text-center text-sm text-navy/60 underline mt-4"
            onClick={() => setMostraDemo(true)}
          >
            {t('login_vedi_esempio')}
          </button>
        )}
      </div>
    </div>
  );
}
