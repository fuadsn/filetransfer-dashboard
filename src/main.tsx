import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted variable fonts (offline-safe): mono body, sans prose, Montserrat titles.
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/inter'
import '@fontsource-variable/montserrat'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
