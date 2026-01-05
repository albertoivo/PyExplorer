import { useState, useCallback } from 'react';
import type { QuestionDocument } from '../../types/question';
import type { HintLevel } from '../../types/education';
import {
    MultipleChoiceQuestion,
    TrueFalseQuestion,
    FillCodeQuestion,
    PartialFunctionQuestion,
    FullFunctionQuestion,
} from './questionTypes';
import { ResultPanel } from './feedback/ResultPanel';
import { ProgressiveHints } from '../education';
import { useAuth } from '../../hooks/useAuth';
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
}

// Chave para armazenar dicas usadas
const USED_HINTS_KEY = 'pyexplorer_used_hints';

/**
 * Motor de questões - decide qual componente renderizar
 * baseado no tipo da questão e coordena o fluxo de resposta
 */
export function QuestionEngine({
    question,
    onComplete,
    onNext,
    onRetry,
}: QuestionEngineProps) {
    const { userData, updateUserData } = useAuth();
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [revealedHints, setRevealedHints] = useState<HintLevel[]>([]);
    const [hintsCost, setHintsCost] = useState(0);

    // Carrega dicas já usadas para esta questão
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

    // Salva dicas usadas
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

    // Handler quando uma dica é revelada
    const handleHintRevealed = useCallback((level: HintLevel, cost: number) => {
        const newRevealed = [...revealedHints, level];
        setRevealedHints(newRevealed);
        setHintsCost(prev => prev + cost);

        // Salva no localStorage
        saveUsedHints(newRevealed);

        // Deduz as estrelas do usuário
        if (cost > 0 && userData) {
            const newScore = Math.max(0, (userData.totalScore || 0) - cost);
            updateUserData?.({ totalScore: newScore });
        }
    }, [revealedHints, saveUsedHints, userData, updateUserData]);

    /**
     * Processa a resposta do usuário
     */
    const handleAnswer = (correct: boolean, _answer: unknown) => {
        setIsCorrect(correct);
        setShowResult(true);
        setShowHints(false);

        // Desconta custo das dicas da pontuação
        let score = correct ? calculateScore(question) : 0;
        if (correct && hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }

        onComplete(correct, score);
    };

    /**
     * Tenta novamente a questão
     */
    const handleRetry = () => {
        setShowResult(false);
        setIsCorrect(false);
        // Mantém as dicas reveladas
        onRetry?.();
    };

    /**
     * Vai para próxima questão
     */
    const handleNext = () => {
        setShowResult(false);
        setIsCorrect(false);
        setShowHints(false);
        setRevealedHints([]);
        setHintsCost(0);
        onNext();
    };

    /**
     * Renderiza o componente de questão apropriado
     */
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
        <div className="question-engine">
            {renderQuestion()}

            {/* Botão de dicas (antes de responder) */}
            {!showResult && (
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
                            isCorrect
                                ? 'Você acertou! Continue assim! 🌟'
                                : 'Não foi dessa vez, mas você está aprendendo!'
                        }
                        explanation={question.explanationKidFriendly}
                        points={isCorrect ? calculateScore(question) - (hintsCost > 0 ? Math.floor(hintsCost / 2) : 0) : undefined}
                        onRetry={!isCorrect ? handleRetry : undefined}
                        onNext={handleNext}
                    />

                    {/* Info de dicas usadas */}
                    {hintsCost > 0 && isCorrect && (
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
    };

    return Math.round(
        base *
        difficultyMultiplier[question.difficulty] *
        typeMultiplier[question.type]
    );
}

export default QuestionEngine;
