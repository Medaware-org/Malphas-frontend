export abstract class CircuitElement {
        static readonly BACKGROUND_COLOR = '#6976ff';
        static readonly CONTOUR_COLOR = '#4b59ed';

        public worldPosition: [number, number];
        protected renderer: CircuitRenderer;

        constructor(renderer: CircuitRenderer, x: number, y: number) {
                this.renderer = renderer;
                this.worldPosition = [x, y];
        }

        abstract render(context: CanvasRenderingContext2D): void;

        drawGeometry(context: CanvasRenderingContext2D, geometry: number[][]): void {
                // Invalid geometry
                if (geometry.length < 3)
                        return;

                context.fillStyle = CircuitElement.BACKGROUND_COLOR;
                context.strokeStyle = CircuitElement.CONTOUR_COLOR;
                context.lineWidth = 4;

                context.beginPath();

                let first = true;
                for (let point of [...geometry, geometry[0]]) {
                        if (point.length != 2)
                                return;
                        let projected = this.renderer.projectPoint(point as unknown as [number, number]);
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
}

export class NotCircuit extends CircuitElement {
        override render(context: CanvasRenderingContext2D): void {
                this.drawGeometry(context, [
                        [0, 2],
                        [4, 0],
                        [0, -2]
                ])
        }
}

export class CircuitRenderer {
        static readonly BACKGROUND_COLOR = '#1b1b1b';
        static readonly GRIDLINES_COLOR = '#3b3b3b';

        static readonly MAX_ZOOM_LEVEL = 2.0;
        static readonly MIN_ZOOM_LEVEL = 0.2;

        private canvas: HTMLCanvasElement;
        private context: CanvasRenderingContext2D;

        private width: number = 0;
        private height: number = 0;
        private aspectRatio: number = 0;

        // The vertical grid subdivisions at scale = 1.0
        private readonly vSubdivisions: number = 15;

        private viewportScale: number = 1.0;
        private viewportPosition: [number, number] = [0, 0];

        private viewportDragging: boolean = false;
        private mousePosition: [number, number] = [0, 0];

        private gridUnit: number = 0;

        private testCircuit: NotCircuit = new NotCircuit(this, 0, 0);

        constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
                this.canvas = canvas;
                this.context = context;

                this.viewportPosition = [
                        window.innerWidth / 2,
                        window.innerHeight / 2,
                ];

                this.setupListeners();
                this.render();
        }

        private drawLine(fromX: number, fromY: number, toX: number, toY: number) {
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
                world[1] = Math.round(world[0]);
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

                // Clamp the offset to the grid
                let xOffset = this.viewportPosition[0] % unitSize
                let yOffset = this.viewportPosition[1] % unitSize

                let n: number;
                for (n = 0; n < hSubdivisions + 2; n++)
                        this.drawLine(n * unitSize + xOffset, yOffset - unitSize, xOffset + n * unitSize, this.height)
                for (n = 0; n < adjVSubdivisions + 1; n++)
                        this.drawLine(xOffset - unitSize, yOffset + n * unitSize, xOffset + this.width + unitSize, yOffset + n * unitSize);

                this.testCircuit.render(this.context);
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

                window.addEventListener('wheel', (event: WheelEvent) => {
                        this.viewportScale -= event.deltaY > 0 ? 0.02 : -0.02;

                        if (this.viewportScale > CircuitRenderer.MAX_ZOOM_LEVEL)
                                this.viewportScale = CircuitRenderer.MAX_ZOOM_LEVEL;

                        if (this.viewportScale < CircuitRenderer.MIN_ZOOM_LEVEL)
                                this.viewportScale = CircuitRenderer.MIN_ZOOM_LEVEL;

                        this.render();
                })

                window.addEventListener('mousedown', (event: MouseEvent) => {
                        this.viewportDragging = (event.button == 1);
                        this.mousePosition = [event.clientX, event.clientY];
                });

                window.addEventListener('mouseup', (event: MouseEvent) => {
                        if (event.button == 1)
                                this.viewportDragging = false;
                });

                window.addEventListener('mousemove', (event: MouseEvent) => {
                        const mousePosition: [number, number] = [event.clientX, event.clientY];
                        const delta = [mousePosition[0] - this.mousePosition[0], mousePosition[1] - this.mousePosition[1]];
                        this.mousePosition = mousePosition;

                        if (!this.viewportDragging)
                                return;

                        this.viewportPosition[0] += delta[0];
                        this.viewportPosition[1] += delta[1];
                        this.render();
                });
        }

}