import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile.css'
import App from './App.tsx'

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

// Dispara o evento para o vite-plugin-prerender capturar a página pronta
requestAnimationFrame(() => {
  document.dispatchEvent(new Event('render-event'));
});
