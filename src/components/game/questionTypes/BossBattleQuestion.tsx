import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { QuestionDocument, PythonExecutionResult } from '../../../types/question';
import './BossBattleQuestion.css';

interface BossBattleQuestionProps {
    question: QuestionDocument;
    onRun: (code: string) => Promise<PythonExecutionResult>;
    onComplete: (score: number) => void;
    onNext: () => void;
    isExecuting: boolean;
}

export function BossBattleQuestion({ question, onRun, onComplete, onNext, isExecuting }: BossBattleQuestionProps) {
    const [code, setCode] = useState(question.bossMetadata?.initialCode || question.starterCode || '');
    const [timeLeft, setTimeLeft] = useState(question.bossMetadata?.timeLimitSeconds || 60);
    const [isActive, setIsActive] = useState(false); // Só começa quando o usuário clica "Iniciar Batalha"
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Efeito para o Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0 && !isGameOver) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsGameOver(true);
                        setFeedback('Ah não! O tempo acabou! O Guardião foi mais rápido desta vez... Tente novamente!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isGameOver]);

    const handleRun = async () => {
        if (!isActive) setIsActive(true); // Garante que o timer tá rodando
        if (isGameOver) return; // Não roda se acabou o tempo

        const result = await onRun(code);

        if (!result.hasError && result.allTestsPassed) {
            // Vitória!
            setIsActive(false); // Para o timer
            setHasWon(true);
            setFeedback(`Incrível! Você derrotou o ${question.bossMetadata?.bossName}!`);
            onComplete(100); // Pontuação máxima do Boss
        } else {
            // Erro ou falha nos testes
            setFeedback(result.stderr || 'O código rodou, mas o Boss não aceitou a resposta. Verifique os requisitos!');
        }
    };

    const handleStart = () => {
        setIsActive(true);
        setFeedback(null);
    };

    const handleRetail = () => {
        setCode(question.bossMetadata?.initialCode || question.starterCode || '');
        setTimeLeft(question.bossMetadata?.timeLimitSeconds || 60);
        setIsGameOver(false);
        setIsActive(false);
        setFeedback(null);
    };

    // Formata o tempo MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isActive && !isGameOver && timeLeft === (question.bossMetadata?.timeLimitSeconds || 60)) {
        return (
            <div className="boss-intro">
                <div className="boss-avatar-large">{question.bossMetadata?.bossAvatar || '👹'}</div>
                <h2>Desafio do Chefe: {question.bossMetadata?.bossName || 'Monstro do Código'}</h2>
                <div className="boss-challenge-desc">
                    <p>{question.prompt}</p>
                    <p className="boss-warning">⚠️ Você terá {question.bossMetadata?.timeLimitSeconds} segundos!</p>
                </div>
                <button className="boss-start-btn" onClick={handleStart}>
                    ⚔️ Iniciar Batalha
                </button>
            </div>
        );
    }

    return (
        <div className={`boss-battle-container ${isGameOver ? 'game-over' : ''} ${timeLeft < 10 ? 'hurry-up' : ''}`}>
            {/* Header da Batalha */}
            <div className="boss-header">
                <div className="boss-info">
                    <span className="boss-avatar-small">{question.bossMetadata?.bossAvatar}</span>
                    <span className="boss-name">{question.bossMetadata?.bossName}</span>
                </div>

                <div className={`boss-timer ${timeLeft < 10 ? 'danger' : ''}`}>
                    <span>⏰</span>
                    <span>{formatTime(timeLeft)}</span>
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
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        scrollBeyondLastLine: false,
                        readOnly: isGameOver
                    }}
                />
            </div>

            {/* Controles */}
            <div className="boss-controls">
                {hasWon ? (
                    <button className="boss-btn victory" onClick={onNext}>
                        🎉 Continuar
                    </button>
                ) : isGameOver ? (
                    <button className="boss-btn retry" onClick={handleRetail}>
                        🔄 Tentar Novamente
                    </button>
                ) : (
                    <button
                        className="boss-btn attack"
                        onClick={handleRun}
                        disabled={isExecuting}
                    >
                        {isExecuting ? 'Conjurando...' : '⚔️ Atacar (Rodar)'}
                    </button>
                )}
            </div>
        </div>
    );
}

