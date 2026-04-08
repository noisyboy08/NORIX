import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="Norix could not start">
      <Router />
    </ErrorBoundary>
  </React.StrictMode>,
)
