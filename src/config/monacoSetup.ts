import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

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
      return new EditorWorker();
    },
  };

  loader.config({ monaco });
  globalScope.__pyExplorerMonacoConfigured = true;
}


