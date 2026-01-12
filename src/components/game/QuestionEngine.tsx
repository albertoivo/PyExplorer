import confetti from 'canvas-confetti';
import { useState, useCallback } from 'react';
import type { QuestionDocument, UserAnswer } from '../../types/question';
import type { HintLevel } from '../../types/education';
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

// ... (existing helper functions: calculateScore, etc)

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
}: QuestionEngineProps) {
    // ... (existing state and hooks)
    const { userData, updateUserData } = useAuth();
    const { runPython, executing: isExecuting } = usePyodide();
    const { react: mascotReact } = useMascotContext();
    const [showResult, setShowResult] = useState(readOnly); // Em readOnly, já mostra como "resultado"
    const [isCorrect, setIsCorrect] = useState(readOnly); // Em readOnly, mostra como correto
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
            const newScore = Math.max(0, (userData.totalScore || 0) - cost);
            // Hints cost reduces both total score and potentially balance? 
            // Usually hints just reduce the POTENTIAL score of the question, 
            // but if we are deducting from totalScore, that's a penalty.
            // Let's stick to deducting from totalScore for now as implemented, 
            // but logic usually is: Hints reduce the points gained from THIS question.
            // The current implementation deducts from GLOBAL score.
            // Let's keep it consistent: Deduct from balance too?
            // "Spending" hints sounds like spending currency.
            // Let's deduct from balance too.
            const newBalance = Math.max(0, (userData.balance || 0) - cost);
            updateUserData?.({ totalScore: newScore, balance: newBalance });
        }
    }, [revealedHints, saveUsedHints, userData, updateUserData]);

    const handleAnswer = (correct: boolean) => {
        setIsCorrect(correct);
        setShowResult(true);
        setShowHints(false);
        mascotReact(correct);

        if (correct) {
            // 🎉 Dispara confetes!
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

        let score = correct ? calculateScore(question) : 0;
        if (correct && hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }
        onComplete(correct, score);
    };

    const handleRetry = () => {
        setShowResult(false);
        setIsCorrect(false);
        onRetry?.();
    };

    const handleNext = () => {
        setShowResult(false);
        setIsCorrect(false);
        setShowHints(false);
        setRevealedHints([]);
        setHintsCost(0);
        onNext();
    };

    const renderQuestion = () => {
        const commonProps = {
            question,
            onAnswer: handleAnswer,
            disabled: showResult,
            showResult,
        };

        switch (question.type) {
            case 'multiple_choice':
                return <MultipleChoiceQuestion {...commonProps} />;

            case 'true_false':
                return <TrueFalseQuestion {...commonProps} />;

            case 'fill_code':
                return <FillCodeQuestion {...commonProps} />;

            case 'partial_function':
                return <PartialFunctionQuestion {...commonProps} />;

            case 'full_function':
                return <FullFunctionQuestion {...commonProps} />;

            case 'parsons_problem':
                return <ParsonsQuestion {...commonProps} />;

            case 'turtle_challenge':
                return <TurtleQuestion {...commonProps} />;

            case 'boss_battle':
                return (
                    <BossBattleQuestion
                        question={question}
                        onRun={async (code) => {
                            // Executa o código usando Pyodide
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
                        }}
                        onComplete={(score) => onComplete(true, score)}
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
            {/* Em modo readOnly, mostra badge de visualização */}
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

            {/* Botão de dicas (antes de responder) - oculto em readOnly */}
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
                        points={readOnly ? undefined : (isCorrect ? calculateScore(question) - (hintsCost > 0 ? Math.floor(hintsCost / 2) : 0) : undefined)}
                        onRetry={!isCorrect && !readOnly ? handleRetry : undefined}
                        onNext={readOnly ? undefined : handleNext}
                    />

                    {/* Info de dicas usadas */}
                    {hintsCost > 0 && isCorrect && !readOnly && (
                        <div className="question-engine__hints-used">
                            💡 Você usou dicas (-{Math.floor(hintsCost / 2)} pontos)
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
        boss_battle: 5.0, // Bosses valem muito!
    };

    return Math.round(
        base *
        difficultyMultiplier[question.difficulty] *
        typeMultiplier[question.type]
    );
}

export default QuestionEngine;
