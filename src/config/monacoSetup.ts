import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';

type MonacoGlobal = typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: () => Worker;
  };
  __pyExplorerMonacoConfigured?: boolean;
};

const globalScope = globalThis as MonacoGlobal;

// Configura o Monaco apenas uma vez para os editores da área de jogo.
if (!globalScope.__pyExplorerMonacoConfigured) {
  globalScope.MonacoEnvironment = {
    getWorker() {
      return new editorWorker();
    },
  };

  loader.config({ monaco });
  globalScope.__pyExplorerMonacoConfigured = true;
}
