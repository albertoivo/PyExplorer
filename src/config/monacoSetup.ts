import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

type MonacoGlobal = typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: (_: string, label: string) => Worker;
  };
  __pyExplorerMonacoConfigured?: boolean;
};

const globalScope = globalThis as MonacoGlobal;

// Configura o Monaco apenas uma vez para os editores da área de jogo.
if (!globalScope.__pyExplorerMonacoConfigured) {
  globalScope.MonacoEnvironment = {
    getWorker() {
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' }
      );
    },
  };

  loader.config({ monaco });
  globalScope.__pyExplorerMonacoConfigured = true;
}

