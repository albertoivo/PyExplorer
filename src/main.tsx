import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import './index.css'
import './styles/mobile.css'
import App from './App.tsx'

// Configura o Monaco Editor para usar a versão local (bundled)
// Isso evita problemas de carregamento via CDN e "caixa branca"
loader.config({ monaco });

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
