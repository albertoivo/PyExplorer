// Local proxy file for Monaco Editor's web worker.
// Vite's ?worker import resolves this local file reliably,
// while the standard module import inside handles node_modules resolution.
// @ts-expect-error - Monaco worker entry has no type declarations
import 'monaco-editor/esm/vs/editor/editor.worker';
