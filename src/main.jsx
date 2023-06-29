import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import './css/index.css'

// strict mode renders twice for some reason

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> 
    <App />
  // </React.StrictMode>,
)
