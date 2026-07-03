import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantProvider'
import ThemeProvider from './context/ThemeProvider'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a2332',
                border: '1px solid #1e293b',
                color: '#fff',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#3b82f6', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>
)
