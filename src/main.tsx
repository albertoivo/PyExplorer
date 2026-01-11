import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile.css'
import App from './App.tsx'

// Função para remover a tela de carregamento inicial
function removeLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  }
}

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Sinaliza que o React montou e remove o loader
// Usamos requestAnimationFrame para garantir que a renderização inicial ocorreu
requestAnimationFrame(() => {
    removeLoadingScreen();
    // @ts-expect-error - window.reactMounted is a custom property for the loader script
    window.reactMounted = true;
});
