import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

type MonacoGlobal = typeof globalThis & {
  MonacoEnvironment?: {
    getWorkerUrl?: (_: string, label: string) => string;
    getWorker?: (_: string, label: string) => Worker;
  };
  __pyExplorerMonacoConfigured?: boolean;
};

const globalScope = globalThis as MonacoGlobal;

// Configura o Monaco apenas uma vez para os editores da área de jogo.
// O plugin vite-plugin-monaco-editor-esm é responsável por configurar o window.MonacoEnvironment
// com os caminhos dos workers em tempo de execução.
if (!globalScope.__pyExplorerMonacoConfigured) {
  loader.config({ monaco });
  globalScope.__pyExplorerMonacoConfigured = true;
}
