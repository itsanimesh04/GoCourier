import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AppStateProvider } from './state/AppState';
import { ServiceModeProvider } from './state/ServiceModeContext';
import { ExtrasCatalogProvider } from './state/ExtrasCatalogContext';
import { ExtrasRequestProvider } from './state/ExtrasRequestContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ServiceModeProvider>
        <ExtrasCatalogProvider>
          <ExtrasRequestProvider>
            <AppStateProvider>
              <App />
            </AppStateProvider>
          </ExtrasRequestProvider>
        </ExtrasCatalogProvider>
      </ServiceModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
