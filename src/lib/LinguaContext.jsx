import { createContext, useContext, useState } from 'react';
import { traduci } from './i18n';

const LinguaContext = createContext();

export function LinguaProvider({ children }) {
  const [lingua, setLingua] = useState('it');
  const t = (chiave) => traduci(chiave, lingua);
  return (
    <LinguaContext.Provider value={{ lingua, setLingua, t }}>
      {children}
    </LinguaContext.Provider>
  );
}

export function useLingua() {
  return useContext(LinguaContext);
}
