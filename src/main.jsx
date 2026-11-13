import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Load global styles once before rendering the app.
import './index.css'
import App from './App.jsx'

// Mount React in the HTML root. StrictMode enables extra development checks.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
