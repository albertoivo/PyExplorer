
import { useEffect, useRef } from 'react';
import './TurtleCanvas.css';

// Definição dos tipos para window global
declare global {
    interface Window {
        turtle_forward: (d: number) => void;
        turtle_right: (a: number) => void;
        turtle_penup: () => void;
        turtle_pendown: () => void;
        turtle_color: (c: string) => void;
        turtle_width: (w: number) => void;
        turtle_speed: (s: number) => void;
        turtle_reset: () => void;
    }
}

interface TurtleState {
    x: number;
    y: number;
    angle: number; // em graus
    penDown: boolean;
    color: string;
    width: number;
    visible: boolean;
}

interface TurtleCanvasProps {
    width?: number;
    height?: number;
    backgroundImage?: string;
    onCommandExecuted?: () => void;
}

type Command =
    | { type: 'FORWARD'; value: number }
    | { type: 'ROTATE'; value: number }
    | { type: 'PENUP' }
    | { type: 'PENDOWN' }
    | { type: 'COLOR'; value: string }
    | { type: 'WIDTH'; value: number }
    | { type: 'SPEED'; value: number }
    | { type: 'RESET' };

export function TurtleCanvas({
    width = 600,
    height = 400,
    backgroundImage,
    onCommandExecuted
}: TurtleCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const commandQueue = useRef<Command[]>([]);
    const isAnimating = useRef(false);
    const animationSpeed = useRef(5); // 1-10

    // Estado visual da tartaruga (para o sprite HTML)
    const turtleSpriteRef = useRef<HTMLDivElement>(null);

    // Estado interno lógico da tartaruga
    const state = useRef<TurtleState>({
        x: 0,
        y: 0,
        angle: 0,
        penDown: true,
        color: 'black',
        width: 2,
        visible: true
    });

    const onCommandExecutedRef = useRef(onCommandExecuted);
    useEffect(() => {
        onCommandExecutedRef.current = onCommandExecuted;
    }, [onCommandExecuted]);

    // Registra listeners globais ao montar
    useEffect(() => {
        // Atualiza a posição do sprite HTML
        const updateTurtleSprite = () => {
            const domX = (state.current.x + width / 2);
            const domY = (-state.current.y + height / 2);

            if (turtleSpriteRef.current) {
                turtleSpriteRef.current.style.left = `${domX}px`;
                turtleSpriteRef.current.style.top = `${domY}px`;
                turtleSpriteRef.current.style.transform = `translate(-50%, -50%) rotate(${state.current.angle}deg)`;
            }
        };

        // Limpa o canvas
        const clearCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Reseta estado
            state.current = {
                x: 0,
                y: 0,
                angle: 0,
                penDown: true,
                color: 'black',
                width: 2,
                visible: true
            };

            updateTurtleSprite();
        };

        // Função auxiliar para desenhar linha
        const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
            if (!state.current.penDown) return;

            ctx.beginPath();
            ctx.moveTo(x1 + width / 2, -y1 + height / 2);
            ctx.lineTo(x2 + width / 2, -y2 + height / 2);
            ctx.strokeStyle = state.current.color;
            ctx.lineWidth = state.current.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        };

        // Processa a fila de animação
        const processQueue = () => {
            if (commandQueue.current.length === 0) {
                isAnimating.current = false;
                onCommandExecutedRef.current?.();
                return;
            }

            isAnimating.current = true;
            const cmd = commandQueue.current[0];
            commandQueue.current = commandQueue.current.slice(1);
            const ctx = canvasRef.current?.getContext('2d');

            if (!cmd || !ctx) {
                requestAnimationFrame(() => processQueue());
                return;
            }

            switch (cmd.type) {
                case 'FORWARD': {
                    const dist = cmd.value;
                    const thetaRad = state.current.angle * (Math.PI / 180);
                    const targetX = state.current.x + dist * Math.cos(thetaRad);
                    const targetY = state.current.y - dist * Math.sin(thetaRad);

                    const startX = state.current.x;
                    const startY = state.current.y;
                    let currentStep = 0;
                    const steps = animationSpeed.current >= 10 ? 1 : Math.max(1, Math.floor(Math.abs(dist) / (animationSpeed.current / 2)));

                    const animateForward = () => {
                        if (currentStep >= steps) {
                            state.current = { ...state.current, x: targetX, y: targetY };
                            updateTurtleSprite();
                            requestAnimationFrame(() => processQueue());
                            return;
                        }
                        currentStep++;
                        const progress = currentStep / steps;
                        const nextX = startX + (targetX - startX) * progress;
                        const nextY = startY + (targetY - startY) * progress;

                        drawLine(ctx, state.current.x, state.current.y, nextX, nextY);

                        state.current = { ...state.current, x: nextX, y: nextY };
                        updateTurtleSprite();

                        requestAnimationFrame(animateForward);
                    };

                    animateForward();
                    return;
                }

                case 'ROTATE': {
                    const targetAngle = state.current.angle + cmd.value;
                    const startAngle = state.current.angle;
                    const rotSteps = animationSpeed.current >= 10 ? 1 : Math.max(1, Math.floor(Math.abs(cmd.value) / (animationSpeed.current)));
                    let rotStep = 0;

                    const animateRotate = () => {
                        if (rotStep >= rotSteps) {
                            state.current = { ...state.current, angle: targetAngle };
                            updateTurtleSprite();
                            requestAnimationFrame(() => processQueue());
                            return;
                        }
                        rotStep++;
                        const progress = rotStep / rotSteps;
                        state.current = { ...state.current, angle: startAngle + (targetAngle - startAngle) * progress };
                        updateTurtleSprite();
                        requestAnimationFrame(animateRotate);
                    };

                    animateRotate();
                    return;
                }

                case 'COLOR':
                    state.current = { ...state.current, color: cmd.value };
                    processQueue();
                    break;

                case 'WIDTH':
                    state.current = { ...state.current, width: cmd.value };
                    processQueue();
                    break;

                case 'PENUP':
                    state.current = { ...state.current, penDown: false };
                    processQueue();
                    break;

                case 'PENDOWN':
                    state.current = { ...state.current, penDown: true };
                    processQueue();
                    break;

                case 'SPEED':
                    animationSpeed.current = cmd.value;
                    processQueue();
                    break;

                case 'RESET':
                    clearCanvas();
                    processQueue();
                    break;
            }
        };

        window.turtle_forward = (d) => { commandQueue.current = [...commandQueue.current, { type: 'FORWARD', value: d }]; if (!isAnimating.current) processQueue(); };
        window.turtle_right = (a) => { commandQueue.current = [...commandQueue.current, { type: 'ROTATE', value: a }]; if (!isAnimating.current) processQueue(); };
        window.turtle_penup = () => { commandQueue.current = [...commandQueue.current, { type: 'PENUP' }]; if (!isAnimating.current) processQueue(); };
        window.turtle_pendown = () => { commandQueue.current = [...commandQueue.current, { type: 'PENDOWN' }]; if (!isAnimating.current) processQueue(); };
        window.turtle_color = (c) => { commandQueue.current = [...commandQueue.current, { type: 'COLOR', value: c }]; if (!isAnimating.current) processQueue(); };
        window.turtle_width = (w) => { commandQueue.current = [...commandQueue.current, { type: 'WIDTH', value: w }]; if (!isAnimating.current) processQueue(); };
        window.turtle_speed = (s) => { commandQueue.current = [...commandQueue.current, { type: 'SPEED', value: s }]; if (!isAnimating.current) processQueue(); };
        window.turtle_reset = () => { commandQueue.current = [...commandQueue.current, { type: 'RESET' }]; if (!isAnimating.current) processQueue(); };

        // Inicializa canvas
        clearCanvas();

        return () => {
            window.turtle_forward = () => { };
            window.turtle_right = () => { };
            window.turtle_penup = () => { };
            window.turtle_pendown = () => { };
            window.turtle_color = () => { };
            window.turtle_width = () => { };
            window.turtle_speed = () => { };
            window.turtle_reset = () => { };
        };
    }, [width, height]);

    // Resize observer para manter canvas nítido? 
    // Por enquanto fixo em width/height props.

    return (
        <div className="turtle-container" style={{ width: width, height: height }}>
            {backgroundImage && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }} />
            )}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="turtle-canvas"
            />
            <div ref={turtleSpriteRef} className="turtle-sprite" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(0deg)' }}>
                🐢
            </div>
        </div>
    );
}

export default TurtleCanvas;
