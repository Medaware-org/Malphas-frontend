import {circuitElements, NotCircuit} from "@/services/editor/circuits.ts";
import type {CircuitElement} from "@/services/editor/element.ts";
import {type CircuitNode, traverseAllAsts, traverseAst} from "@/services/editor/ast.ts";
import {useComponentsStore} from "@/stores/components.ts";

export class CircuitRenderer {
        static readonly BACKGROUND_COLOR = '#0A0A0A';
        static readonly GRIDLINES_COLOR = '#1A1A1A';
        static readonly CURSOR_COLOR = '#ecf0f1';

        static readonly MAX_ZOOM_LEVEL = 2.0;
        static readonly MIN_ZOOM_LEVEL = 0.02;

        // The upper zoom value from that onwards we don't render grid lines anymore (Performance reasons)
        static readonly GRID_RENDER_THRESHOLD = 0.1;

        private canvas: HTMLCanvasElement;
        private readonly context: CanvasRenderingContext2D;

        private width: number = 0;
        private height: number = 0;
        private aspectRatio: number = 0;
        private gridUnit: number = 0;

        // The vertical grid subdivisions at scale = 1.0
        private readonly vSubdivisions: number = 15;

        private viewportScale: number = 1.0;
        private viewportPosition: [number, number] = [0, 0];

        private viewportDragging: boolean = false;
        private mousePosition: [number, number] = [0, 0];

        private mousePresent: boolean = true

        private ast: CircuitNode[]

        constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
                this.canvas = canvas;
                this.context = context;

                this.ast = useComponentsStore().ast!! as unknown as CircuitNode[]

                this.centerView(false);

                this.setupListeners();
                this.render();
        }

        public centerView(reRender: boolean = true) {
                this.viewportScale = 1.0;
                this.viewportPosition = [
                        window.innerWidth / 2,
                        window.innerHeight / 2,
                ];
                if (reRender)
                        this.render();
        }

        public zoomIn() {
                this.zoom(-0.5);
        }

        public zoomOut() {
                this.zoom(0.5);
        }

        private zoom(delta: number) {
                this.viewportScale -= delta;

                if (this.viewportScale > CircuitRenderer.MAX_ZOOM_LEVEL)
                        this.viewportScale = CircuitRenderer.MAX_ZOOM_LEVEL;

                if (this.viewportScale < CircuitRenderer.MIN_ZOOM_LEVEL)
                        this.viewportScale = CircuitRenderer.MIN_ZOOM_LEVEL;

                this.render();
        }

        public drawLine(fromX: number, fromY: number, toX: number, toY: number) {
                this.context.beginPath();
                this.context.moveTo(fromX, fromY);
                this.context.lineTo(toX, toY);
                this.context.closePath();
                this.context.stroke();
        }

        /**
         * Convert a point from world space to screen space coordinates
         * @param point - The world space point to project
         */
        public projectPoint(point: [number, number]): [number, number] {
                return [
                        this.viewportPosition[0] + point[0] * this.gridUnit,
                        this.viewportPosition[1] + point[1] * this.gridUnit
                ];
        }

        public isScreenPointVisible(point: [number, number]): boolean {
                return point[0] >= 0 && point[0] < this.width && point[1] >= 0 && point[1] < this.height;
        }

        public isWorldPointVisible(point: [number, number]): boolean {
                return this.isScreenPointVisible(this.projectPoint(point));
        }

        /**
         * Convert a point from screen space to world space
         * @param point - The screen space point to un-project
         * @param snap - Determines whether the point should be 'snapped' to the nearest grid (integer) boundary
         */
        public unprojectPoint(point: [number, number], snap: boolean = false): [number, number] {
                let world: [number, number] = [
                        (point[0] - this.viewportPosition[0]) / this.gridUnit,
                        (point[1] - this.viewportPosition[1]) / this.gridUnit
                ];

                if (!snap)
                        return world;

                world[0] = Math.round(world[0]);
                world[1] = Math.round(world[1]);
                return world;
        }

        private render() {
                this.context.lineWidth = 1;

                this.context.fillStyle = CircuitRenderer.BACKGROUND_COLOR;
                this.context.fillRect(0, 0, this.width, this.height);

                this.context.strokeStyle = CircuitRenderer.GRIDLINES_COLOR;

                // We want the subdivision squares to be actual squares, so we need to take the AR into account
                let adjVSubdivisions = this.vSubdivisions / this.viewportScale;
                let hSubdivisions = adjVSubdivisions * this.aspectRatio;
                let unitSize = this.height / adjVSubdivisions;

                this.gridUnit = unitSize;

                if (this.viewportScale > CircuitRenderer.GRID_RENDER_THRESHOLD) {
                        // Clamp the offset to the grid
                        let xOffset = this.viewportPosition[0] % unitSize
                        let yOffset = this.viewportPosition[1] % unitSize

                        let n: number;
                        for (n = 0; n < hSubdivisions + 2; n++)
                                this.drawLine(n * unitSize + xOffset, yOffset - unitSize, xOffset + n * unitSize, this.height)
                        for (n = 0; n < adjVSubdivisions + 1; n++)
                                this.drawLine(xOffset - unitSize, yOffset + n * unitSize, xOffset + this.width + unitSize, yOffset + n * unitSize);
                }

                // Render the circuits and wiring
                traverseAllAsts(this.ast, (node) => {
                        if ('location' in node) {
                                node.element.draw(node.location, this, this.context)
                        }

                        if ('source' in node && 'target' in node) {
                                const source = node.source; // Source circuit
                                const target = node.target; // Destination circuit

                                const [sourceOutputNumber, sourceOutputCoords] = [source[0], source[1].element.outputs()];
                                const [targetInputNumber, targetInputCoords] = [target[0], target[1].element.inputs()];

                                const sourceCoord = sourceOutputCoords[sourceOutputNumber].map((coord, i) => coord + source[1].location[i])
                                const targetCoord = targetInputCoords[targetInputNumber].map((coord, i) => coord + target[1].location[i])

                                if (sourceCoord.length == 2 || targetCoord.length == 2) {
                                        this.context.strokeStyle = 'white';
                                        this.context.lineWidth = 5;

                                        this.drawLine(...this.projectPoint(sourceCoord as unknown as [number, number]),
                                                ...this.projectPoint(targetCoord as unknown as [number, number]))
                                }
                        }
                })

                // Draw the cursor
                if (this.mousePresent) {
                        let snappedToGrid = this.unprojectPoint(this.mousePosition, true)
                        let projected = this.projectPoint(snappedToGrid);
                        this.context.lineWidth = 1;
                        this.context.strokeStyle = CircuitRenderer.CURSOR_COLOR;
                        this.drawLine(projected[0], projected[1] - this.gridUnit, projected[0], projected[1] + this.gridUnit);
                        this.drawLine(projected[0] - this.gridUnit, projected[1], projected[0] + this.gridUnit, projected[1]);
                }
        }

        private setupListeners() {
                const updateDimensions = () => {
                        this.width = window.innerWidth;
                        this.height = window.innerHeight;
                        this.aspectRatio = this.width / this.height;
                        this.canvas.width = this.width;
                        this.canvas.height = this.height;
                };

                updateDimensions()

                // Re-render the view when the window (and thus the canvas) changes size
                window.addEventListener('resize', (event: UIEvent) => {
                        updateDimensions()
                        this.render();
                })

                this.canvas.addEventListener('wheel', (event: WheelEvent) => {
                        this.zoom(event.deltaY > 0 ? 0.03 : -0.03)
                })

                this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
                        this.viewportDragging = (event.button == 1);
                        this.mousePosition = [event.clientX, event.clientY];
                });

                this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
                        if (event.button == 1)
                                this.viewportDragging = false;
                });

                this.canvas.addEventListener('mouseleave', (event: MouseEvent) => {
                        this.mousePresent = false
                        this.render()
                })

                this.canvas.addEventListener('mouseenter', (event: MouseEvent) => {
                        this.mousePresent = true
                        this.render()
                })

                this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
                        const mousePosition: [number, number] = [event.clientX, event.clientY];
                        const delta = [mousePosition[0] - this.mousePosition[0], mousePosition[1] - this.mousePosition[1]];
                        this.mousePosition = mousePosition;

                        if (!this.viewportDragging) {
                                this.render();
                                return;
                        }

                        this.viewportPosition[0] += delta[0];
                        this.viewportPosition[1] += delta[1];
                        this.render();
                });
        }

}