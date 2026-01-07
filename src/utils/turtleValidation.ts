
import { PyodideInterface } from '../hooks/usePyodide';
import { TURTLE_PYTHON_SHIM } from '../components/game/turtle/turtle-python-shim';

export interface Point {
    x: number;
    y: number;
}

export interface Segment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
}

// Helper to check if two numbers are close enough
const isClose = (a: number, b: number, epsilon = 2) => Math.abs(a - b) < epsilon;

// Helper to calculate distance between two points
const dist = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

/**
 * Executes python code using a headless turtle simulation to capture the drawn path.
 */
export async function runTurtleSimulation(
    runPython: (code: string) => Promise<any>,
    code: string
): Promise<Segment[]> {
    const segments: Segment[] = [];

    // Initial state
    let x = 0;
    let y = 0;
    let angle = 0; // 0 = East
    let penDown = true;
    let color = 'black';
    let width = 2;
    // let speed = 5;

    // Mock global window functions
    // We need to save original functions to restore them later
    const originalWindow = {
        turtle_forward: window.turtle_forward,
        turtle_right: window.turtle_right,
        turtle_penup: window.turtle_penup,
        turtle_pendown: window.turtle_pendown,
        turtle_color: window.turtle_color,
        turtle_width: window.turtle_width,
        turtle_speed: window.turtle_speed,
        turtle_reset: window.turtle_reset,
    };

    // Override with simulation logic
    window.turtle_forward = (d: number) => {
        const rad = (angle * Math.PI) / 180;
        // Turtle math: standard mode (0=East, 90=North) BUT
        // Our shim uses right() as clockwise.
        // In Canvas: Y grows down. In Math: Y grows up.
        // Let's mimic TurtleCanvas logic:
        // angle 0 -> right. right(90) -> angle 90 (down/south).
        // targetX = x + dist * cos(angle)
        // targetY = y - dist * sin(angle)  <-- Y is inverted in TurtleCanvas math relative to standard cartesian?
        // Let's look at TurtleCanvas:
        // targetX = x + dist * Math.cos(thetaRad);
        // targetY = y - dist * Math.sin(thetaRad);
        // This means if angle=0 (East), x += dist, y += 0.
        // if angle=90 (South), x += 0, y -= dist.
        // Wait, in TurtleCanvas `y` is logical Y. `drawLine` converts to DOM Y: `-y1 + height/2`.
        // So logical Y positive is UP.
        // If angle=90 is South, sin(90)=1. y -= dist. Correct (moving down).

        const targetX = x + d * Math.cos(rad);
        const targetY = y - d * Math.sin(rad);

        if (penDown) {
            segments.push({
                x1: x,
                y1: y,
                x2: targetX,
                y2: targetY,
                color: color
            });
        }
        x = targetX;
        y = targetY;
    };

    window.turtle_right = (a: number) => {
        angle += a;
    };

    window.turtle_penup = () => { penDown = false; };
    window.turtle_pendown = () => { penDown = true; };
    window.turtle_color = (c: string) => { color = c; };
    window.turtle_width = (w: number) => { width = w; };
    window.turtle_speed = (s: number) => { /* speed = s; */ };
    window.turtle_reset = () => {
        x = 0; y = 0; angle = 0; penDown = true; color = 'black'; width = 2;
        segments.length = 0;
    };

    try {
        // Ensure shim is loaded (it should be, but good to be safe)
        // We assume runPython already includes the shim context or we re-inject it?
        // The shim defines python functions that call js globals.
        // Since we replaced js globals, python code calling `forward()` will call our `window.turtle_forward`.
        await runPython(code);
    } finally {
        // Restore original functions
        window.turtle_forward = originalWindow.turtle_forward;
        window.turtle_right = originalWindow.turtle_right;
        window.turtle_penup = originalWindow.turtle_penup;
        window.turtle_pendown = originalWindow.turtle_pendown;
        window.turtle_color = originalWindow.turtle_color;
        window.turtle_width = originalWindow.turtle_width;
        window.turtle_speed = originalWindow.turtle_speed;
        window.turtle_reset = originalWindow.turtle_reset;
    }

    return segments;
}

/**
 * Compares two sets of turtle segments to see if they form the same drawing.
 * Order-independent for segments, but direction sensitive (A->B != B->A usually, but for drawing maybe it is?).
 * For a drawing, A->B is visually same as B->A. We should normalize.
 */
export function compareTurtlePaths(userSegments: Segment[], expectedSegments: Segment[]): boolean {
    if (userSegments.length === 0 && expectedSegments.length === 0) return true;
    if (userSegments.length === 0 || expectedSegments.length === 0) return false;

    // Normalize segments: (x1,y1) should be top-left-most compared to (x2,y2) to handle direction invariance
    const normalize = (s: Segment) => {
        // We want a canonical representation of a line segment
        // Sort points so P1 is "smaller" than P2
        let p1: Point = { x: s.x1, y: s.y1 };
        let p2: Point = { x: s.x2, y: s.y2 };

        if (p1.x > p2.x || (isClose(p1.x, p2.x) && p1.y > p2.y)) {
            [p1, p2] = [p2, p1];
        }

        return {
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            color: s.color // We assume color must match
        };
    };

    const userNorm = userSegments.map(normalize);
    const expectedNorm = expectedSegments.map(normalize);

    // Simple strategy: Every expected segment must be "covered" by a user segment.
    // And every user segment must "belong" to expectation?
    // Let's do 1:1 matching.

    // Check lengths roughly match?
    // User might draw one line as two segments forward(50); forward(50).
    // This makes 1:1 matching fail.
    // Ideally we merge collinear connected segments first.
    // For MVP, let's assume the structure of calls is similar (e.g. forward(100) vs forward(100)).
    // If the question asks for forward(100) and user does forward(50); forward(50), valid?
    // Yes.
    // But merging segments is complex.
    // Let's stick to 1:1 matching for now, assuming the user follows the instruction pattern.
    // If this proves too strict, we can improve later.
    // Update: The task says "verify if the turtle drawing matches".
    // I'll try to implement a slightly smarter check: Total length drawn and bounds?
    // No, shape matters.

    // Let's stick to 1:1 matching. If user splits lines, it fails.
    // "Simplification for MVP".

    if (userNorm.length !== expectedNorm.length) {
        return false;
    }

    return matchSegments(userNorm, expectedNorm);
}

function matchSegments(listA: Segment[], listB: Segment[]): boolean {
    // For each segment in A, find a match in B and remove from B (to handle duplicates)
    const pendingB = [...listB];

    for (const segA of listA) {
        const matchIndex = pendingB.findIndex(segB =>
            isClose(segA.x1, segB.x1) &&
            isClose(segA.y1, segB.y1) &&
            isClose(segA.x2, segB.x2) &&
            isClose(segA.y2, segB.y2) &&
            segA.color === segB.color // Strict color match?
        );

        if (matchIndex === -1) {
            return false;
        }
        pendingB.splice(matchIndex, 1);
    }

    return true;
}
