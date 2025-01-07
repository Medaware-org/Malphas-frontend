import {CircuitRenderer} from "@/services/editor/renderer.ts";
import {InputCircuit, OutputCircuit} from "@/services/editor/circuits.ts";

export abstract class CircuitElement {
        static readonly BACKGROUND_COLOR = '#37cdbe';
        static readonly CONTOUR_COLOR = '#27a89b';
        static readonly IO_CONTOUR_COLOR = '#636e72'
        static readonly IO_COLOR_HIGH = '#27ae60';
        static readonly IO_COLOR_LOW = '#e74c3c';

        static readonly CONNECTION_COLOR = '#ecf0f1';
        static readonly CONNECTION_SIZE = 0.15;

        constructor() {
        }

        abstract geometry(): number[][];

        abstract inputs(): number[][];

        abstract outputs(): number[][];

        abstract logic(inputs: boolean[]): boolean;

        drawGeometry(worldPosition: [number, number], renderer: CircuitRenderer, context: CanvasRenderingContext2D, result: boolean): void {
                if (!this.isVisible(worldPosition, renderer))
                        return;

                let geometry = this.geometry();

                // Invalid geometry
                if (geometry.length < 3)
                        return;

                if (this instanceof InputCircuit || this instanceof OutputCircuit) {
                        if (result)
                                context.fillStyle = CircuitElement.IO_COLOR_HIGH;
                        else
                                context.fillStyle = CircuitElement.IO_COLOR_LOW;
                        context.strokeStyle = CircuitElement.IO_CONTOUR_COLOR;
                } else {
                        context.fillStyle = CircuitElement.BACKGROUND_COLOR;
                        context.strokeStyle = CircuitElement.CONTOUR_COLOR;
                }
                context.lineWidth = 7;

                context.beginPath();

                let first = true;
                for (let point of [...geometry, geometry[0]]) {
                        if (point.length != 2)
                                return;
                        let absolutePoint = [
                                point[0] + worldPosition[0],
                                point[1] + worldPosition[1]
                        ];
                        let projected = renderer.projectPoint(absolutePoint as unknown as [number, number]);
                        if (first) {
                                context.moveTo(...projected);
                                first = false;
                                continue;
                        }
                        context.lineTo(...projected);
                }

                context.closePath();
                context.fill();
                context.stroke();
        }

        private drawConnectionPoint(renderer: CircuitRenderer, point: [number, number]): void {
                let horizLine = [
                        renderer.projectPoint([point[0] - CircuitElement.CONNECTION_SIZE, point[1]]),
                        renderer.projectPoint([point[0] + CircuitElement.CONNECTION_SIZE, point[1]])
                ];
                let vertLine = [
                        renderer.projectPoint([point[0], point[1] - CircuitElement.CONNECTION_SIZE]),
                        renderer.projectPoint([point[0], point[1] + CircuitElement.CONNECTION_SIZE])
                ];
                renderer.drawLine(horizLine[0][0], horizLine[0][1], horizLine[1][0], horizLine[1][1]);
                renderer.drawLine(vertLine[0][0], vertLine[0][1], vertLine[1][0], vertLine[1][1]);
        }

        drawConnections(worldPosition: [number, number], renderer: CircuitRenderer, context: CanvasRenderingContext2D): void {
                if (!this.isVisible(worldPosition, renderer))
                        return;

                context.strokeStyle = CircuitElement.CONNECTION_COLOR;
                context.lineWidth = 5;

                for (let conn of [...this.inputs(), ...this.outputs()]) {
                        if (conn.length != 2)
                                continue;

                        let absoluteConn = [
                                conn[0] + worldPosition[0],
                                conn[1] + worldPosition[1],
                        ];

                        this.drawConnectionPoint(renderer, absoluteConn as unknown as [number, number])
                }
        }

        draw(worldPosition: [number, number], renderer: CircuitRenderer, context: CanvasRenderingContext2D, result: boolean): void {
                if (!this.isVisible(worldPosition, renderer))
                        return;

                this.drawGeometry(worldPosition, renderer, context, result);
                this.drawConnections(worldPosition, renderer, context);
        }

        isVisible(worldPosition: [number, number], renderer: CircuitRenderer): boolean {
                for (let point of this.geometry()) {
                        if (point.length != 2)
                                continue;

                        let absolutePoint = [
                                point[0] + worldPosition[0],
                                point[1] + worldPosition[1]
                        ];

                        if (renderer.isWorldPointVisible(absolutePoint as unknown as [number, number]))
                                return true;
                }

                return false;
        }
}