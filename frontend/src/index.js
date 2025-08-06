import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationProvider } from './context/NotificationContext'; // ✅ Import it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>  {/* ✅ Wrap the app here */}
      <App />
    </NotificationProvider>
  </React.StrictMode>
);
