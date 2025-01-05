export abstract class CircuitElement {
        static readonly BACKGROUND_COLOR = '#37cdbe';
        static readonly CONTOUR_COLOR = '#27a89b';
        static readonly CONNECTION_COLOR = '#ecf0f1';
        static readonly CONNECTION_SIZE = 0.15;

        public worldPosition: [number, number];
        protected renderer: CircuitRenderer;

        constructor(renderer: CircuitRenderer, x: number, y: number) {
                this.renderer = renderer;
                this.worldPosition = [x, y];
        }

        abstract geometry(): number[][];

        abstract connections(): number[][];

        drawGeometry(context: CanvasRenderingContext2D): void {
                if (!this.isVisible())
                        return;

                let geometry = this.geometry();

                // Invalid geometry
                if (geometry.length < 3)
                        return;

                context.fillStyle = CircuitElement.BACKGROUND_COLOR;
                context.strokeStyle = CircuitElement.CONTOUR_COLOR;
                context.lineWidth = 7;

                context.beginPath();

                let first = true;
                for (let point of [...geometry, geometry[0]]) {
                        if (point.length != 2)
                                return;
                        let absolutePoint = [
                                point[0] + this.worldPosition[0],
                                point[1] + this.worldPosition[1]
                        ];
                        let projected = this.renderer.projectPoint(absolutePoint as unknown as [number, number]);
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

        private drawConnectionPoint(point: [number, number]): void {
                let horizLine = [
                        this.renderer.projectPoint([point[0] - CircuitElement.CONNECTION_SIZE, point[1]]),
                        this.renderer.projectPoint([point[0] + CircuitElement.CONNECTION_SIZE, point[1]])
                ];
                let vertLine = [
                        this.renderer.projectPoint([point[0], point[1] - CircuitElement.CONNECTION_SIZE]),
                        this.renderer.projectPoint([point[0], point[1] + CircuitElement.CONNECTION_SIZE])
                ];
                this.renderer.drawLine(horizLine[0][0], horizLine[0][1], horizLine[1][0], horizLine[1][1]);
                this.renderer.drawLine(vertLine[0][0], vertLine[0][1], vertLine[1][0], vertLine[1][1]);
        }

        drawConnections(context: CanvasRenderingContext2D): void {
                if (!this.isVisible())
                        return;

                context.strokeStyle = CircuitElement.CONNECTION_COLOR;
                context.lineWidth = 5;

                for (let conn of this.connections()) {
                        if (conn.length != 2)
                                continue;

                        let absoluteConn = [
                                conn[0] + this.worldPosition[0],
                                conn[1] + this.worldPosition[1],
                        ];

                        this.drawConnectionPoint(absoluteConn as unknown as [number, number])
                }
        }

        draw(context: CanvasRenderingContext2D): void {
                if (!this.isVisible())
                        return;

                this.drawGeometry(context);
                this.drawConnections(context);
        }

        isVisible(): boolean {
                for (let point of this.geometry()) {
                        if (point.length != 2)
                                continue;

                        let absolutePoint = [
                                point[0] + this.worldPosition[0],
                                point[1] + this.worldPosition[1]
                        ];

                        if (this.renderer.isWorldPointVisible(absolutePoint as unknown as [number, number]))
                                return true;
                }

                return false;
        }
}

export class NotCircuit extends CircuitElement {
        override geometry(): number[][] {
                return [
                        [0, 2],
                        [4, 0],
                        [0, -2]
                ];
        }

        override connections(): number[][] {
                return [
                        [0, 1],
                        [0, -1],
                        [4, 0]
                ];
        }
}

enum PointerStatus {
        NONE,
        ERROR,
        OK
}

export class CircuitRenderer {
        static readonly BACKGROUND_COLOR = '#0A0A0A';
        static readonly GRIDLINES_COLOR = '#1A1A1A';
        static readonly CURSOR_COLOR = '#ecf0f1';

        static readonly MAX_ZOOM_LEVEL = 2.0;
        static readonly MIN_ZOOM_LEVEL = 0.02;

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

        private pointerStatus: PointerStatus = PointerStatus.NONE;

        private testCircuit: NotCircuit = new NotCircuit(this, -3, 0);

        constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
                this.canvas = canvas;
                this.context = context;

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

                // Clamp the offset to the grid
                let xOffset = this.viewportPosition[0] % unitSize
                let yOffset = this.viewportPosition[1] % unitSize

                let n: number;
                for (n = 0; n < hSubdivisions + 2; n++)
                        this.drawLine(n * unitSize + xOffset, yOffset - unitSize, xOffset + n * unitSize, this.height)
                for (n = 0; n < adjVSubdivisions + 1; n++)
                        this.drawLine(xOffset - unitSize, yOffset + n * unitSize, xOffset + this.width + unitSize, yOffset + n * unitSize);

                this.testCircuit.draw(this.context)

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