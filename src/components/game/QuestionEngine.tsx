import confetti from 'canvas-confetti';
import { useState, useCallback } from 'react';
import type { QuestionDocument, UserAnswer } from '../../types/question';
import type { HintLevel } from '../../types/education';
import type { PowerUpType } from '../../types/gamification';
import {
    MultipleChoiceQuestion,
    TrueFalseQuestion,
    FillCodeQuestion,
    PartialFunctionQuestion,
    FullFunctionQuestion,
    ParsonsQuestion,
    TurtleQuestion,
} from './questionTypes';
import { BossBattleQuestion } from './questionTypes/BossBattleQuestion';
import { ResultPanel } from './feedback/ResultPanel';
import { ProgressiveHints } from '../education';
import { playSound } from '../../utils/soundEffects';
import { useAuth } from '../../hooks/useAuth';
import { usePyodide } from '../../context/PyodideContext';
import { useMascotContext } from '../../context/MascotContext';
import './QuestionEngine.css';

interface QuestionEngineProps {
    /** Questão a ser renderizada */
    question: QuestionDocument;
    /** Callback quando a questão é respondida */
    onComplete: (passed: boolean, score: number) => void;
    /** Callback para pular para próxima questão */
    onNext: () => void;
    /** Callback para tentar novamente */
    onRetry?: () => void;
    /** Modo somente leitura (visualização de resposta anterior) */
    readOnly?: boolean;
    /** Resposta salva do usuário (para exibir em modo readOnly) */
    savedAnswer?: UserAnswer;
    /** Power-up ativo nesta tentativa */
    activePowerUp?: PowerUpType | null;
}

// Chave para armazenar dicas usadas
const USED_HINTS_KEY = 'pyexplorer_used_hints';

export function QuestionEngine({
    question,
    onComplete,
    onNext,
    onRetry,
    readOnly = false,
    savedAnswer,
    activePowerUp,
}: QuestionEngineProps) {
    const { userData, updateUserData } = useAuth();
    const { runPython, executing: isExecuting } = usePyodide();
    const { react: mascotReact } = useMascotContext();

    // Estados mudam com a questão
    const [showResult, setShowResult] = useState(readOnly);
    const [isCorrect, setIsCorrect] = useState(readOnly);
    const [showHints, setShowHints] = useState(false);
    const [revealedHints, setRevealedHints] = useState<HintLevel[]>([]);
    const [hintsCost, setHintsCost] = useState(0);



    const loadUsedHints = useCallback((): HintLevel[] => {
        try {
            const stored = localStorage.getItem(USED_HINTS_KEY);
            if (stored) {
                const map: Record<string, HintLevel[]> = JSON.parse(stored);
                return map[question.id] || [];
            }
        } catch {
            // Ignora erros
        }
        return [];
    }, [question.id]);

    const saveUsedHints = useCallback((hints: HintLevel[]) => {
        try {
            const stored = localStorage.getItem(USED_HINTS_KEY);
            const map: Record<string, HintLevel[]> = stored ? JSON.parse(stored) : {};
            map[question.id] = hints;
            localStorage.setItem(USED_HINTS_KEY, JSON.stringify(map));
        } catch {
            // Ignora erros
        }
    }, [question.id]);

    const handleHintRevealed = useCallback((level: HintLevel, cost: number) => {
        const newRevealed = [...revealedHints, level];
        setRevealedHints(newRevealed);
        setHintsCost(prev => prev + cost);
        saveUsedHints(newRevealed);

        if (cost > 0 && userData) {
            // Deduzir custo tanto do score total quanto do saldo (como uma "compra")
            // Decisão: Hints custam 'pontos de score' da questão E 'moedas/estrelas'?
            // Normalmente, hints diminuem a recompensa da questão.
            // Mas aqui estamos deduzindo do totalScore global (se existir).
            // E também do saldo (balance).
            const newScore = Math.max(0, (userData.totalScore || 0) - cost);
            const newBalance = Math.max(0, (userData.balance || 0) - cost);
            updateUserData?.({ totalScore: newScore, balance: newBalance });
        }
    }, [revealedHints, saveUsedHints, userData, updateUserData]);

    const getFinalScore = useCallback(() => {
        let score = calculateScore(question);
        if (hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }
        if (activePowerUp === 'double_stars') {
            score *= 2;
        }
        return score;
    }, [question, hintsCost, activePowerUp]);

    const handleAnswer = useCallback((correct: boolean) => {
        setIsCorrect(correct);
        setShowResult(true);
        setShowHints(false);
        mascotReact(correct);

        if (correct) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
            });
            playSound('success');
        } else {
            playSound('error');
        }

        // Calcula score para onComplete (sem double_stars, pois GamePage gerencia isso)
        // Mas com desconto de dicas
        let score = correct ? calculateScore(question) : 0;
        if (correct && hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }
        onComplete(correct, score);
    }, [setIsCorrect, setShowResult, setShowHints, mascotReact, question, onComplete, hintsCost]);

    const handleRetry = useCallback(() => {
        setShowResult(false);
        setIsCorrect(false);
        onRetry?.();
    }, [onRetry]);

    const handleNext = useCallback(() => {
        setShowResult(false);
        setIsCorrect(false);
        setShowHints(false);
        setRevealedHints([]);
        setHintsCost(0);
        onNext();
    }, [onNext]);

    const handleBossRun = useCallback(async (code: string) => {
        try {
            return await runPython(code, question.tests);
        } catch (error) {
            return {
                stdout: '',
                stderr: String(error),
                hasError: true,
                allTestsPassed: false
            };
        }
    }, [runPython, question.tests]);

    const handleBossComplete = useCallback((score: number) => {
        onComplete(true, score);
    }, [onComplete]);

    const renderQuestion = () => {
        const commonProps = {
            question,
            onAnswer: handleAnswer,
            disabled: showResult,
            showResult,
            activePowerUp: activePowerUp || undefined
        };

        switch (question.type) {
            case 'multiple_choice':
                return <MultipleChoiceQuestion key={question.id} {...commonProps} />;

            case 'true_false':
                return <TrueFalseQuestion key={question.id} {...commonProps} />;

            case 'fill_code':
                return <FillCodeQuestion key={question.id} {...commonProps} />;

            case 'partial_function':
                return <PartialFunctionQuestion key={question.id} {...commonProps} />;

            case 'full_function':
                return <FullFunctionQuestion key={question.id} {...commonProps} />;

            case 'parsons_problem':
                return <ParsonsQuestion key={question.id} {...commonProps} />;

            case 'turtle_challenge':
                return <TurtleQuestion key={question.id} {...commonProps} />;

            case 'boss_battle':
                return (
                    <BossBattleQuestion
                        key={question.id}
                        question={question}
                        onRun={handleBossRun}
                        onComplete={handleBossComplete}
                        onNext={handleNext}
                        isExecuting={isExecuting}
                    />
                );

            default:
                return (
                    <div className="question-engine__unsupported">
                        <span className="question-engine__unsupported-icon">🚧</span>
                        <p>Tipo de questão não suportado: {question.type}</p>
                    </div>
                );
        }
    };

    return (
        <div className={`question-engine ${readOnly ? 'question-engine--readonly' : ''}`}>
            {readOnly && (
                <div className="question-engine__readonly-badge">
                    📖 Modo Visualização
                    {savedAnswer !== undefined && (
                        <span className="question-engine__readonly-badge-sub">
                            Sua resposta está destacada abaixo
                        </span>
                    )}
                </div>
            )}

            {renderQuestion()}

            {!showResult && !readOnly && (
                <div className="question-engine__hints-section">
                    <button
                        className={`question-engine__hints-toggle ${showHints ? 'question-engine__hints-toggle--active' : ''}`}
                        onClick={() => setShowHints(!showHints)}
                    >
                        💡 {showHints ? 'Esconder Dicas' : 'Preciso de Ajuda'}
                        {revealedHints.length > 0 && (
                            <span className="question-engine__hints-count">
                                {revealedHints.length}/3
                            </span>
                        )}
                    </button>

                    {showHints && (
                        <ProgressiveHints
                            questionId={question.id}
                            explanation={question.explanationKidFriendly}
                            revealedHints={revealedHints.length > 0 ? revealedHints : loadUsedHints()}
                            onHintRevealed={handleHintRevealed}
                        />
                    )}
                </div>
            )}

            {showResult && (
                <div className="question-engine__result">
                    <ResultPanel
                        success={isCorrect}
                        message={
                            readOnly
                                ? 'Você já completou esta questão! 🎉'
                                : isCorrect
                                    ? 'Você acertou! Continue assim! 🌟'
                                    : 'Não foi dessa vez, mas você está aprendendo!'
                        }
                        explanation={question.explanationKidFriendly}
                        points={readOnly ? undefined : (isCorrect ? getFinalScore() : undefined)}
                        onRetry={!isCorrect && !readOnly ? handleRetry : undefined}
                        onNext={readOnly ? undefined : handleNext}
                    />

                    {hintsCost > 0 && isCorrect && !readOnly && (
                        <div className="question-engine__hints-used">
                            💡 Você usou dicas (-{Math.floor(hintsCost / 2)} pontos)
                        </div>
                    )}

                    {activePowerUp === 'double_stars' && isCorrect && !readOnly && (
                        <div className="question-engine__powerup-used" style={{ color: '#FFD700', marginTop: '0.5rem', fontWeight: 'bold' }}>
                            ✨ Double Stars Ativo! (x2 pontos)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Calcula a pontuação baseada na dificuldade da questão
 */
function calculateScore(question: QuestionDocument): number {
    const base = question.points || 10;

    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
    };

    const typeMultiplier = {
        multiple_choice: 1,
        true_false: 0.8,
        fill_code: 1.5,
        partial_function: 1.8,
        full_function: 2,
        parsons_problem: 1.5,
        turtle_challenge: 1.5,
        boss_battle: 5.0,
    };

    return Math.round(
        base *
        difficultyMultiplier[question.difficulty] *
        typeMultiplier[question.type]
    );
}

export default QuestionEngine;
