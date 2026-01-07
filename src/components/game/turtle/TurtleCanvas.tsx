
import { useEffect, useRef, useState, useCallback } from 'react';
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
    const [turtleStyle, setTurtleStyle] = useState({
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) rotate(0deg)'
    });

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

    // Limpa o canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reseta estado
        state.current = {
            x: 0,
            y: 0,
            angle: 0, // 0 aponta para direita (leste)
            penDown: true,
            color: 'black',
            width: 2,
            visible: true
        };

        updateTurtleSprite();
    }, []);

    // Atualiza a posição do sprite HTML
    const updateTurtleSprite = () => {
        // Converte coordenadas cartesianas (0,0 no centro) para coordenadas do DOM (top/left)
        // Y inverte: para cima é positivo no turtle, mas negativo no DOM
        const domX = (state.current.x + width / 2);
        const domY = (-state.current.y + height / 2);

        setTurtleStyle({
            left: `${domX}px`,
            top: `${domY}px`,
            // Rotação: 0 graus no turtle é direita. CSS rotate 0 é direita também? 
            // Normal do CSS roda sentido horário. Turtle setamos .right() como clockwise.
            // Mas Turtle 0 é Leste. CSS 0 é padrão para cima ou direita dependendo do icon.
            // Vamos assumir icone 🐢 aponta para direita original.
            // Turtle right(90) -> 90 graus (sul).
            // CSS rotate(90deg) -> vira sentido horário. 
            // Então: transform: rotate(-angle deg) ou similar.
            // python turtle: 0=East, 90=North, 180=West, 270=South (standard mode).
            // MAS nossa implementação python shim manda `right(angle)`.
            // Se eu tenho angulo absoluto...
            // Vamos manter `state.angle` como acumulado de rotações.
            // Se `turtle.right(90)` é enviado, angle += 90 (sentido horário).
            // CSS rotate(90deg) é horário. Então bate.
            // Único detalhe: Python turtle padrão começa Leste. Se nosso icone aponta leste, ok.
            // Se icone aponta pra cima, precisamos somar offset.
            // O icone padrão 🐢 costuma estar de lado. Vamos assumir Leste.
            transform: `translate(-50%, -50%) rotate(${state.current.angle}deg)`
        });
    };

    // Processa a fila de animação
    const processQueue = useCallback(() => {
        if (commandQueue.current.length === 0) {
            isAnimating.current = false;
            onCommandExecuted?.();
            return;
        }

        isAnimating.current = true;
        const cmd = commandQueue.current.shift();
        const ctx = canvasRef.current?.getContext('2d');

        if (!cmd || !ctx) {
            requestAnimationFrame(processQueue);
            return;
        }

        // Configurações baseadas na velocidade
        // Se speed for max (10), faz instantâneo.
        // Se não, divide movimento em passos.


        // Função auxiliar para desenhar linha
        const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
            if (!state.current.penDown) return;

            ctx.beginPath();
            ctx.moveTo(x1 + width / 2, -y1 + height / 2);
            ctx.lineTo(x2 + width / 2, -y2 + height / 2);
            ctx.strokeStyle = state.current.color;
            ctx.lineWidth = state.current.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        };

        switch (cmd.type) {
            case 'FORWARD':
                const dist = cmd.value;

                // Espera... Se angle aumenta horário (right), então:
                // 0 -> cos=1, sin=0 -> x+
                // 90 -> cos=0, sin=1 -> y- (para baixo no canvas, que é Y+)
                // Mas no nosso sistema cartesiano Y+ é pra cima.
                // Então 90 graus (sul) deve diminuir Y.
                // cos(90) = 0. sin(90) = 1.
                // dx = dist * cos(theta). dy = dist * sin(theta).
                // Se theta = 90 (graus horario), = -90 (graus cartesiano).

                // Vamos simplificar: ângulo `state.current.angle` cresce horário.
                // dx = dist * Math.cos(state.current.angle * Math.PI / 180)
                // dy = dist * Math.sin(state.current.angle * Math.PI / 180) 
                // X aumenta para direita. Y aumenta para BAIXO no canvas nativo.
                // Se ângulo 0: dx=d, dy=0. (Direita). OK.
                // Se ângulo 90 (Sul): dx=0, dy=d. (Baixo). OK.
                // Então podemos usar Math.cos/sin direto se considerarmos Y do canvas.

                // Mas para o `state` lógico, eu mantive Y "matemático" (cima positivo) no `updateTurtleSprite`.
                // updateTurtleSprite: `(-state.current.y + height / 2)`
                // Então meu state Y cresce para cima.
                // Se 90 graus é SUL: x não muda, Y diminui.
                // cos(90) = 0. sin(90) = 1.
                // dx = d * cos(theta). dy = -d * sin(theta) (pois sin(90) daria +1, mas quero descer).

                const thetaRad = state.current.angle * (Math.PI / 180);
                const targetX = state.current.x + dist * Math.cos(thetaRad);
                const targetY = state.current.y - dist * Math.sin(thetaRad); // Y cresce pra cima, angulo cresce horário (pra baixo)

                // Animação de forward
                let startX = state.current.x;
                let startY = state.current.y;
                let currentStep = 0;
                // Passos dependem da distância e velocidade
                const steps = animationSpeed.current >= 10 ? 1 : Math.max(1, Math.floor(Math.abs(dist) / (animationSpeed.current / 2)));

                const animateForward = () => {
                    if (currentStep >= steps) {
                        state.current.x = targetX;
                        state.current.y = targetY;
                        updateTurtleSprite();
                        processQueue();
                        return;
                    }
                    currentStep++;
                    const progress = currentStep / steps;
                    const nextX = startX + (targetX - startX) * progress;
                    const nextY = startY + (targetY - startY) * progress;

                    drawLine(state.current.x, state.current.y, nextX, nextY);

                    state.current.x = nextX;
                    state.current.y = nextY;
                    updateTurtleSprite();

                    requestAnimationFrame(animateForward);
                };

                animateForward();
                return; // Retorna para não chamar processQueue imediatamente

            case 'ROTATE':
                const targetAngle = state.current.angle + cmd.value;

                // Animação de rotação
                let startAngle = state.current.angle;
                let rotSteps = animationSpeed.current >= 10 ? 1 : Math.max(1, Math.floor(Math.abs(cmd.value) / (animationSpeed.current)));
                let rotStep = 0;

                const animateRotate = () => {
                    if (rotStep >= rotSteps) {
                        state.current.angle = targetAngle;
                        updateTurtleSprite();
                        processQueue();
                        return;
                    }
                    rotStep++;
                    const progress = rotStep / rotSteps;
                    state.current.angle = startAngle + (targetAngle - startAngle) * progress;
                    updateTurtleSprite();
                    requestAnimationFrame(animateRotate);
                };

                animateRotate();
                return;

            case 'COLOR':
                state.current.color = cmd.value;
                processQueue();
                break;

            case 'WIDTH':
                state.current.width = cmd.value;
                processQueue();
                break;

            case 'PENUP':
                state.current.penDown = false;
                processQueue();
                break;

            case 'PENDOWN':
                state.current.penDown = true;
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

    }, [width, height, clearCanvas]);

    // Registra listeners globais ao montar
    useEffect(() => {
        window.turtle_forward = (d) => { commandQueue.current.push({ type: 'FORWARD', value: d }); if (!isAnimating.current) processQueue(); };
        window.turtle_right = (a) => { commandQueue.current.push({ type: 'ROTATE', value: a }); if (!isAnimating.current) processQueue(); };
        window.turtle_penup = () => { commandQueue.current.push({ type: 'PENUP' }); if (!isAnimating.current) processQueue(); };
        window.turtle_pendown = () => { commandQueue.current.push({ type: 'PENDOWN' }); if (!isAnimating.current) processQueue(); };
        window.turtle_color = (c) => { commandQueue.current.push({ type: 'COLOR', value: c }); if (!isAnimating.current) processQueue(); };
        window.turtle_width = (w) => { commandQueue.current.push({ type: 'WIDTH', value: w }); if (!isAnimating.current) processQueue(); };
        window.turtle_speed = (s) => { commandQueue.current.push({ type: 'SPEED', value: s }); if (!isAnimating.current) processQueue(); };
        window.turtle_reset = () => { commandQueue.current.push({ type: 'RESET' }); if (!isAnimating.current) processQueue(); };

        // Inicializa canvas
        clearCanvas();

        return () => {
            // Cleanup: remove funções globais para evitar vazamento ou chamadas em componente desmontado
            // Opcional: deixar como no-op
            window.turtle_forward = () => { };
            window.turtle_right = () => { };
            // ...
        };
    }, [clearCanvas, processQueue]);

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
            <div className="turtle-sprite" style={turtleStyle}>
                🐢
            </div>
        </div>
    );
}

export default TurtleCanvas;
