import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No root element');
createRoot(rootEl).render(<App />);
