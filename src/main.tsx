import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import './index.css'
import './styles/mobile.css'
import App from './App.tsx'

// Importa os workers do Monaco Editor para funcionamento em produção
// Isso é necessário para Vite - sem isso o editor fica com "caixa branca"
// Inline para evitar falhas de carregamento de worker em produção/offline
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// Configura o MonacoEnvironment para usar os workers locais
// Esta configuração é ESSENCIAL para produção com Vite
self.MonacoEnvironment = {
  getWorker() {
    // Para Python, só precisamos do editor worker básico
    // (Python não tem IntelliSense nativo no Monaco como JS/TS/CSS/JSON)
    return new EditorWorker()
  }
}

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

const rootElement = document.getElementById('root')!;

// React 19: Usar hydrateRoot se houver conteúdo (vido do SSG), senão createRoot
if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Sinaliza que o React montou e remove o loader
requestAnimationFrame(() => {
  removeLoadingScreen();
  // @ts-expect-error - window.reactMounted is a custom property for the loader script
  window.reactMounted = true;

  // Dispara o evento para o vite-plugin-prerender capturar a página pronta
  document.dispatchEvent(new Event('render-event'));
});
