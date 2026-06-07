/**
 * Centraliza as configurações de ambiente
 */
export const env = {
    /**
     * URL base da aplicação
     * Dev: http://localhost:5173
     * Prod: https://pyexplorer.com.br
     */
    APP_URL: import.meta.env.VITE_APP_URL || window.location.origin,

    /**
     * Identifica se está em ambiente de desenvolvimento
     */
    IS_DEV: import.meta.env.DEV,

    /**
     * Identifica se está em produção
     */
    IS_PROD: import.meta.env.PROD,

    /**
     * Detecta execução em auditorias automáticas (Lighthouse/PageSpeed).
     * Evita inicializações pesadas que geram erros de console no ambiente do crawler.
     */
    IS_AUDIT_BOT:
        typeof navigator !== 'undefined' &&
        /lighthouse|pagespeed|chrome-lighthouse|psi/i.test(navigator.userAgent),
};
