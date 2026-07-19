import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyMockFetchPatch } from './lib/mockFetch.ts';

// Apply the global API fetch interceptor for Vercel / serverless fallback deployments
applyMockFetchPatch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
