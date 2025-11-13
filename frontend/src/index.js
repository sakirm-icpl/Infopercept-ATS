import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './modern-theme.css';
import './App.css';
import App from './App';

// Ensure only one instance of React app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasChildNodes()) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 