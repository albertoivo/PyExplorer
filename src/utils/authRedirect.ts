/**
 * Utilitário para gerenciar o estado de redirecionamento após o login.
 * Separado do componente LoginPage para evitar problemas com Fast Refresh.
 */
let hasRedirectedAfterLogin = false;

/**
 * Reseta a flag de redirecionamento.
 * Chamada durante o logout para permitir que o próximo login acione o redirecionamento.
 */
export function resetLoginRedirectFlag() {
    hasRedirectedAfterLogin = false;
}

/**
 * Verifica se o redirecionamento já ocorreu.
 */
export function getHasRedirected() {
    return hasRedirectedAfterLogin;
}

/**
 * Marca que o redirecionamento ocorreu.
 */
export function setHasRedirected(value: boolean) {
    hasRedirectedAfterLogin = value;
}
