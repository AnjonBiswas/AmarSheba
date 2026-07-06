import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles/index.css';

const savedTheme = localStorage.getItem('amarsheba-theme') || 'light';
document.documentElement.classList.toggle('dark', savedTheme === 'dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
);
