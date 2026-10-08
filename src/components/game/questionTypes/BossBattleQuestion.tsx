import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import '../../../config/monacoSetup';
import type { QuestionDocument, PythonExecutionResult } from '../../../types/question';
import './BossBattleQuestion.css';

interface BossBattleQuestionProps {
    question: QuestionDocument;
    onRun: (code: string) => Promise<PythonExecutionResult>;
    onComplete: (score: number) => void;
    onNext: () => void;
    isExecuting: boolean;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const BossBattleQuestion = memo(function BossBattleQuestion({ question, onRun, onComplete, onNext, isExecuting }: BossBattleQuestionProps) {
    const { t } = useTranslation('game');
    const [code, setCode] = useState(question.bossMetadata?.initialCode || question.starterCode || '');
    const [timeLeft, setTimeLeft] = useState(question.bossMetadata?.timeLimitSeconds || 60);
    const [isActive, setIsActive] = useState(false); // Só começa quando o usuário clica "Iniciar Batalha"
    const [hasWon, setHasWon] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const bossName = question.bossMetadata?.bossName || t('boss.defaultMonsterName', 'Monstro do Código');

    // Timer de contagem regressiva
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && !isGameOver && !hasWon) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsGameOver(true);
                        setFeedback(t('boss.timeoutFeedback', 'Ah não! O tempo acabou! O Guardião foi mais rápido desta vez... Tente novamente!'));
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, isGameOver, hasWon, t]);

    const handleRun = async () => {
        if (!isActive) setIsActive(true); // Garante que o timer tá rodando

        setFeedback(null);
        const result = await onRun(code);

        if (!result.hasError && result.allTestsPassed) {
            // Vitória!
            setIsActive(false); // Para o timer
            setHasWon(true);
            setFeedback(t('boss.victoryFeedback', { defaultValue: 'Incrível! Você derrotou o {{name}}!', name: bossName }));
            onComplete(100); // Pontuação máxima do Boss
        } else {
            // Erro ou falha nos testes
            setFeedback(result.stderr || t('boss.rejectedFeedback', 'O código rodou, mas o Boss não aceitou a resposta. Verifique os requisitos!'));
        }
    };

    const handleStart = () => {
        setIsActive(true);
    };

    const handleRetail = () => {
        setIsGameOver(false);
        setHasWon(false);
        setTimeLeft(question.bossMetadata?.timeLimitSeconds || 60);
        setFeedback(null);
        setIsActive(true);
    };

    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on' as const,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: 'on' as const,
        accessibilitySupport: 'off' as const,
    }), []);

    const handleEditorChange = useCallback((value: string | undefined) => {
        setCode(value || '');
    }, []);

    if (!isActive && !hasWon && !isGameOver) {
        return (
            <div className="boss-intro">
                <div className="boss-avatar-large">{question.bossMetadata?.bossAvatar || '👹'}</div>
                <h2>{t('boss.title', { defaultValue: 'Desafio do Chefe: {{name}}', name: bossName })}</h2>
                <div className="boss-challenge-desc">
                    <p>{question.prompt}</p>
                    <p className="boss-warning">
                        {t('boss.warning', { defaultValue: '⚠️ Você terá {{seconds}} segundos!', seconds: question.bossMetadata?.timeLimitSeconds || 60 })}
                    </p>
                </div>
                <button className="boss-start-btn" onClick={handleStart}>
                    {t('boss.start', '⚔️ Iniciar Batalha')}
                </button>
            </div>
        );
    }

    return (
        <div className={`boss-battle-container ${hasWon ? 'victory' : ''} ${isGameOver ? 'game-over' : ''}`}>
            {/* Header da Batalha: Avatar do Chefe e Barra de Tempo */}
            <div className="boss-header">
                <div className="boss-info">
                    <span className="boss-avatar">{question.bossMetadata?.bossAvatar || '👹'}</span>
                    <div>
                        <h3>{bossName}</h3>
                        <span className="boss-status">
                            {hasWon
                                ? t('boss.statusDefeated', 'DERROTADO! 💀')
                                : isGameOver
                                ? t('boss.statusVictorious', 'VITORIOSO... 😈')
                                : t('boss.statusFurious', 'FURIOSO! ⚡')}
                        </span>
                    </div>
                </div>

                <div className="boss-timer">
                    <span className="timer-icon">⏳</span>
                    <span className={`timer-text ${timeLeft <= 10 ? 'urgent' : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {/* Prompt e Feedback */}
            <div className="boss-prompt">
                <p>{question.prompt}</p>
            </div>

            {feedback && (
                <div className={`boss-feedback ${isGameOver ? 'failure' : 'info'}`}>
                    {feedback}
                </div>
            )}

            {/* Editor de Código */}
            <div className="boss-editor-wrapper">
                <Editor
                    height="300px"
                    defaultLanguage="python"
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={editorOptions}
                />
            </div>

            {/* Controles */}
            <div className="boss-controls">
                {hasWon ? (
                    <button className="boss-btn victory" onClick={onNext}>
                        {t('boss.continue', '🎉 Continuar')}
                    </button>
                ) : isGameOver ? (
                    <button className="boss-btn retry" onClick={handleRetail}>
                        {t('boss.retry', '🔄 Tentar Novamente')}
                    </button>
                ) : (
                    <button
                        className="boss-btn attack"
                        onClick={handleRun}
                        disabled={isExecuting}
                    >
                        {isExecuting ? t('boss.casting', 'Conjurando...') : t('boss.attack', '⚔️ Atacar (Rodar)')}
                    </button>
                )}
            </div>
        </div>
    );
});
