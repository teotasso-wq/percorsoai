import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LinguaProvider } from './lib/LinguaContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LinguaProvider>
      <App />
    </LinguaProvider>
  </StrictMode>,
)
