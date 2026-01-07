
import { describe, it, expect, vi } from 'vitest';
import { compareTurtlePaths, runTurtleSimulation, Segment } from '../utils/turtleValidation';

describe('turtleValidation', () => {
    describe('compareTurtlePaths', () => {
        it('should return true for identical paths', () => {
            const path1: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' },
                { x1: 100, y1: 0, x2: 100, y2: 100, color: 'black' }
            ];
            const path2: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' },
                { x1: 100, y1: 0, x2: 100, y2: 100, color: 'black' }
            ];
            expect(compareTurtlePaths(path1, path2)).toBe(true);
        });

        it('should return true for paths with different segment order', () => {
            const path1: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' },
                { x1: 100, y1: 0, x2: 100, y2: 100, color: 'black' }
            ];
            const path2: Segment[] = [
                { x1: 100, y1: 0, x2: 100, y2: 100, color: 'black' },
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' }
            ];
            expect(compareTurtlePaths(path1, path2)).toBe(true);
        });

        it('should return true for segments drawn in reverse direction', () => {
            const path1: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' }
            ];
            const path2: Segment[] = [
                { x1: 100, y1: 0, x2: 0, y2: 0, color: 'black' }
            ];
            expect(compareTurtlePaths(path1, path2)).toBe(true);
        });

        it('should return false for different paths', () => {
            const path1: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' }
            ];
            const path2: Segment[] = [
                { x1: 0, y1: 0, x2: 50, y2: 0, color: 'black' }
            ];
            expect(compareTurtlePaths(path1, path2)).toBe(false);
        });

        it('should return false if segment count differs', () => {
             const path1: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' }
            ];
            const path2: Segment[] = [
                { x1: 0, y1: 0, x2: 100, y2: 0, color: 'black' },
                { x1: 100, y1: 0, x2: 200, y2: 0, color: 'black' }
            ];
            expect(compareTurtlePaths(path1, path2)).toBe(false);
        });
    });

    describe('runTurtleSimulation', () => {
        it('should capture segments from python code', async () => {
            // Mock runPython to execute the simulation logic
            // Since runTurtleSimulation relies on runPython calling window.turtle_*, we need to simulate that.
            // But runPython is passed in.

            const mockRunPython = async (code: string) => {
                // Manually call window.turtle_* commands that the code WOULD call
                if (code === 'forward(100)\nright(90)\nforward(100)') {
                    window.turtle_forward(100);
                    window.turtle_right(90);
                    window.turtle_forward(100);
                }
            };

            // Setup mock window functions (they are mocked inside runTurtleSimulation, but we need initial existence)
            window.turtle_forward = vi.fn();
            window.turtle_right = vi.fn();
            window.turtle_reset = vi.fn();
            window.turtle_penup = vi.fn();
            window.turtle_pendown = vi.fn();
            window.turtle_color = vi.fn();
            window.turtle_width = vi.fn();
            window.turtle_speed = vi.fn();

            const code = 'forward(100)\nright(90)\nforward(100)';

            const segments = await runTurtleSimulation(mockRunPython, code);

            expect(segments.length).toBe(2);
            // First segment: 0,0 to 100,0 (Angle 0)
            expect(segments[0].x1).toBe(0);
            expect(segments[0].y1).toBe(0);
            expect(segments[0].x2).toBe(100);
            expect(segments[0].y2).toBe(0);

            // Second segment: 100,0 to 100,-100 (Angle 90 -> South -> y decreases in math, but wait)
            // In runTurtleSimulation: targetY = y - dist * Math.sin(rad).
            // Angle starts 0. Right(90) -> Angle 90.
            // rad = PI/2. sin(PI/2) = 1. cos(PI/2) = 0.
            // targetX = 100 + 100*0 = 100.
            // targetY = 0 - 100*1 = -100.

            expect(segments[1].x1).toBe(100);
            expect(segments[1].y1).toBe(0);
            expect(segments[1].x2).toBe(100);
            expect(segments[1].y2).toBeCloseTo(-100);
        });
    });
});
