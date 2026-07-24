export interface PyodideLoaderProps {
    loadingProgress: number;
}

/**
 * Componente que exibe a tela de carregamento do Pyodide/Python.
 */
export function PyodideLoader({ loadingProgress }: PyodideLoaderProps) {
    return (
        <div className="game-page game-page--loading">
            <div className="pyodide-loading">
                <div className="pyodide-loading__icon">🐍</div>
                <h2 className="pyodide-loading__title">Preparando o Python...</h2>
                <div className="pyodide-loading__bar">
                    <div
                        className="pyodide-loading__progress"
                        style={{ width: `${loadingProgress}%` }}
                    />
                </div>
                <p className="pyodide-loading__text">
                    {loadingProgress < 30 && 'Carregando bibliotecas...'}
                    {loadingProgress >= 30 && loadingProgress < 80 && 'Inicializando Python...'}
                    {loadingProgress >= 80 && 'Quase pronto!'}
                </p>
            </div>
        </div>
    );
}
