import {type CircuitNode, type WireNode, traverseAllAsts, traverseAst} from "@/services/editor/ast.ts";
import {useComponentsStore} from "@/stores/components.ts";
import {Api} from "@/services/api.ts";
import {useScenesStore} from "@/stores/scenes.ts";
import type {SceneDto} from "@/api";

function commitDrag(node: CircuitNode) {
        Api.circuit.updateCircuit({
                id: node.dto.id,
                circuitUpdateDto: {
                        location_x: node.location[0],
                        location_y: node.location[1]
                }
        }).subscribe({
                next: () => {
                },
                error: (err: any) => {
                }
        })
}

function createWire(src: CircuitNode, srcIndex: number, dst: CircuitNode, dstIndex: number, path: [number, number][], okCallback: () => void) {
        Api.wire.postWire({
                wireCreationDto: {
                        source_circuit: src.dto.id,
                        target_circuit: dst.dto.id,
                        init_signal: false,
                        number_input: srcIndex,
                        number_output: dstIndex,
                        location: JSON.stringify(path)
                }
        }).subscribe({
                next: () => {
                        okCallback();
                },
                error: (err: any) => {
                }
        })
}

function deleteWire(node: WireNode, okCallback: () => void) {
        Api.wire.deleteWire({
                id: node.dto.id
        }).subscribe({
                next: () => {
                        okCallback();
                },
                error: (err: any) => {
                }
        })
}

function createGate(scene: SceneDto, gateType: string, location: [number, number], okCallback: () => void) {
        Api.circuit.postCircuit({
                circuitCreationDto: {
                        parent_scene: scene.id,
                        gate_type: gateType,
                        location_x: location[0],
                        location_y: location[1]
                }
        }).subscribe({
                next: () => {
                        okCallback();
                },
                error: (err: any) => {
                }
        })
}

export class CircuitRenderer {
        static readonly BACKGROUND_COLOR = '#0A0A0A';
        static readonly GRIDLINES_COLOR = '#1A1A1A';
        static readonly CURSOR_COLOR = '#ecf0f1';

        static readonly TMP_WIRE_COLOR_INVALID = '#485460';
        static readonly TMP_WIRE_COLOR_OK = '#f6e58d';

        static readonly WIRE_COLOR_HIGH = '#27ae60';
        static readonly WIRE_COLOR_LOW = '#e74c3c';

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
        private snappedMousePosition: [number, number] = [0, 0];

        private mousePresent: boolean = true

        private ast: CircuitNode[]

        //
        // Stuff to keep track of and manage the editing process
        //

        private wirePath: [number, number][] = []

        private isTmpWireValid = false;

        private draggingNode: CircuitNode | undefined = undefined

        // [CoordX, CoordY], Circuit, Index
        private cachedInputs: [[number, number], CircuitNode, number][] = [];
        private cachedOutputs: [[number, number], CircuitNode, number][] = [];

        private wireCache: [WireNode, [number, number][]][] = []

        private components

        // Circuit, Index, Type
        private wireStart: [CircuitNode, number, 'input' | 'output'] | undefined = undefined
        private locationType: [CircuitNode | undefined, number, 'input' | 'output' | 'empty'] = [undefined, 0, 'empty'];

        constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
                this.canvas = canvas;
                this.context = context;

                this.components = useComponentsStore()
                this.ast = this.components.ast!! as unknown as CircuitNode[]

                if (!this.components.viewportPosition)
                        this.centerView(false);
                else
                        this.viewportPosition = this.components.viewportPosition

                if (!this.components.viewportScale)
                        this.viewportScale = 1.0
                else
                        this.viewportScale = this.components.viewportScale

                this.setupListeners();
                this.render();
        }

        public addGate(type: string) {
                createGate(useScenesStore().selectedScene!!, type, this.snappedMousePosition, () => {
                        this.rebuildAst();
                })
        }

        private deleteWire() {
                const bufferWidth = 10;

                let toDelete: WireNode | undefined = undefined

                for (const wire of this.wireCache) {
                        if (toDelete)
                                break;
                        for (let i = 0; i < wire[1].length; i++) {
                                if (i + 1 >= wire[1].length)
                                        break;

                                const current = wire[1][i]
                                const next = wire[1][i + 1]

                                const [x, y] = this.mousePosition;
                                const [x1, y1] = this.projectPoint(current)
                                const [x2, y2] = this.projectPoint(next)

                                let d = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

                                if (x >= Math.min(x1, x2) - bufferWidth && x <= Math.max(x1, x2) + bufferWidth &&
                                        y >= Math.min(y1, y2) - bufferWidth && y <= Math.max(y1, y2) + bufferWidth) {
                                        toDelete = wire[0]
                                        break;
                                }
                        }
                }

                if (toDelete)
                        deleteWire(toDelete, () => {
                                this.rebuildAst()
                        })
        }

        private rebuildAst() {
                const components = useComponentsStore()
                components.loadWiresAndCircuits(useScenesStore().selectedScene!!, () => {
                }, () => {
                        components.buildAst(() => {
                        }, () => {
                                this.ast = components.ast as unknown as CircuitNode[];
                        });
                })
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

                this.components.viewportScale = this.viewportScale;

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
                this.cachedInputs = []
                this.cachedOutputs = []

                traverseAllAsts(this.ast, (node) => {
                        if ('location' in node) {
                                node.element.draw(node.location, this, this.context)
                                node.element.inputs().forEach((input, index) => {
                                        this.cachedInputs.push([
                                                [input[0] + node.location[0], input[1] + node.location[1]],
                                                node,
                                                index
                                        ])
                                })
                                node.element.outputs().forEach((output, index) => {
                                        this.cachedOutputs.push([
                                                [output[0] + node.location[0], output[1] + node.location[1]],
                                                node,
                                                index
                                        ])
                                })
                        }

                        if ('source' in node && 'target' in node) {
                                const source = node.source; // Source circuit
                                const target = node.target; // Destination circuit

                                const [sourceOutputNumber, sourceOutputCoords] = [source[0], source[1].element.outputs()];
                                const [targetInputNumber, targetInputCoords] = [target[0], target[1].element.inputs()];

                                const sourceCoord = sourceOutputCoords[sourceOutputNumber].map((coord, i) => coord + source[1].location[i])
                                const targetCoord = targetInputCoords[targetInputNumber].map((coord, i) => coord + target[1].location[i])

                                for (let i = 0; i < node.path.length; i++) {
                                        if (node.result)
                                                this.context.strokeStyle = CircuitRenderer.WIRE_COLOR_HIGH
                                        else
                                                this.context.strokeStyle = CircuitRenderer.WIRE_COLOR_LOW

                                        this.context.lineWidth = 3

                                        const current = this.projectPoint(node.path[i])
                                        if (i == 0)
                                                this.drawLine(...this.projectPoint(sourceCoord as unknown as [number, number]), ...current)
                                        else if (i + 1 >= node.path.length) {
                                                this.drawLine(...current, ...this.projectPoint(targetCoord as unknown as [number, number]))
                                                break;
                                        }
                                        const next = this.projectPoint(node.path[i + 1])
                                        this.drawLine(...current, ...next)
                                }

                                this.wireCache.push([node, node.path])
                        }
                })

                // Draw temporary wire
                for (let i = 0; i < this.wirePath.length; i++) {
                        this.context.strokeStyle = this.isTmpWireValid ?
                                CircuitRenderer.TMP_WIRE_COLOR_OK : CircuitRenderer.TMP_WIRE_COLOR_INVALID;
                        this.context.lineWidth = 3;

                        if (i + 1 >= this.wirePath.length) {
                                this.drawLine(...this.projectPoint(this.wirePath[i]), ...this.projectPoint(this.snappedMousePosition));
                                break;
                        }

                        this.drawLine(...this.projectPoint(this.wirePath[i]), ...this.projectPoint(this.wirePath[i + 1]))
                }

                // Draw the cursor
                if (this.mousePresent) {
                        let projected = this.projectPoint(this.snappedMousePosition);
                        this.context.lineWidth = 1;
                        this.context.strokeStyle = CircuitRenderer.CURSOR_COLOR;
                        this.drawLine(projected[0], projected[1] - this.gridUnit, projected[0], projected[1] + this.gridUnit);
                        this.drawLine(projected[0] - this.gridUnit, projected[1], projected[0] + this.gridUnit, projected[1]);
                }
        }

        /**
         * Check if a point is inside a given geometry
         */
        private rayCast(point: [number, number], geometry: [number, number][], worldOffset: [number, number]): boolean {
                let inside = false
                const [x, y] = point;
                for (let i = 0; i < geometry.length; i++) {
                        const [x1, y1] = geometry[i].map((coord, i) => coord + worldOffset[i]);
                        const [x2, y2] = geometry[(i + 1) % geometry.length].map((coord, i) => coord + worldOffset[i]);

                        // Check if the point's Y coordinate is within the Y range of the edge
                        if (!((y1 > y) != (y2 > y)))
                                continue;

                        const intersection = x1 + (y - y1) * (x2 - x1) / (y2 - y1);

                        if (x < intersection)
                                inside = !inside;
                }
                return inside
        }

        private startDragging() {
                traverseAllAsts(this.ast, (node) => {
                        if (this.draggingNode)
                                return;

                        if ('location' in node) {
                                if (!node.element.isVisible(node.location, this))
                                        return;

                                if (this.rayCast(this.snappedMousePosition, node.element.geometry() as unknown as [number, number][], node.location)) {
                                        this.draggingNode = node;
                                        return;
                                }
                        }
                })
        }

        private adjustForOffset(point: [number, number]): [number, number] {
                return [point[0] + this.viewportPosition[0], point[1] + this.viewportPosition[1]]
        }

        private comparePoint(point: [number, number], another: [number, number]): boolean {
                return point[0] == another[0] && point[1] == another[1]
        }

        private updateLocationType() {
                let matchingInput = this.cachedInputs.find((input) => this.comparePoint(input[0], this.snappedMousePosition));
                let matchingOutput = this.cachedOutputs.find((output) => this.comparePoint(output[0], this.snappedMousePosition));
                if (matchingInput) {
                        this.locationType = [matchingInput[1], matchingInput[2], 'input']
                } else if (matchingOutput) {
                        this.locationType = [matchingOutput[1], matchingOutput[2], 'output']
                } else {
                        this.locationType = [undefined, 0, 'empty']
                }
        }

        private updateTmpWireValidity() {
                if (!this.wireStart) {
                        this.isTmpWireValid = false
                        return
                }

                this.isTmpWireValid = (this.locationType[2] == 'input' && this.wireStart[2] != 'input'
                                || this.locationType[2] == 'output' && this.wireStart[2] != 'output')
                        && this.wireStart[0] != this.locationType[0];
        }

        private layConnectionPoint() {
                // A wire must start on a connection
                if (this.wirePath.length == 0) {
                        if (this.locationType[2] == 'empty' || !this.locationType[0])
                                return;

                        this.wireStart = [this.locationType[0], this.locationType[1], this.locationType[2]]
                        this.wirePath.push(this.snappedMousePosition);
                        return;
                }

                if (this.locationType[2] == 'empty')
                        this.wirePath.push(this.snappedMousePosition);

                // A wire must end on the opposite type of connection
                if (this.isTmpWireValid) {
                        this.wirePath.push(this.snappedMousePosition);

                        let params: [CircuitNode, number, CircuitNode, number, [number, number][]]
                                = [this.wireStart!![0], this.wireStart!![1], this.locationType[0]!!, this.locationType[1], this.wirePath]

                        // The wire was drawn output to input; we need to re-orient the parameters
                        if (this.wireStart!![2] == 'input') {
                                params = [this.locationType[0]!!, this.locationType[1], this.wireStart!![0], this.wireStart!![1], this.wirePath.reverse()]
                        }

                        this.wirePath = []

                        createWire(...params, () => {
                                this.rebuildAst();
                        })
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

                window.addEventListener('keydown', (event: KeyboardEvent) => {
                        if (event.key == "Escape") {
                                this.wirePath = [];
                                this.render();
                                return;
                        }

                        if (event.key == "x") {
                                this.deleteWire();
                                return;
                        }
                })

                // The right mouse button is used for dragging
                this.canvas.addEventListener('contextmenu', (event: UIEvent) => {
                        event.preventDefault();
                })

                this.canvas.addEventListener('wheel', (event: WheelEvent) => {
                        this.zoom(event.deltaY > 0 ? 0.03 : -0.03)
                })

                this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
                        this.viewportDragging = (event.button == 1);
                        this.mousePosition = [event.clientX, event.clientY];

                        if (event.button == 2 && !this.draggingNode && this.wirePath.length == 0) {
                                this.startDragging();
                                return;
                        }

                        if ((event.button == 0 || event.button == 2) && this.draggingNode) {
                                commitDrag(this.draggingNode)
                                this.draggingNode = undefined; // Commit the changes!
                                return;
                        }

                        if (event.button == 0)
                                this.layConnectionPoint();
                });

                this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
                        if (event.button == 1) {
                                this.viewportDragging = false;
                                this.components.viewportPosition = this.viewportPosition;
                        }
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
                        const snapped = this.unprojectPoint(this.mousePosition, true)

                        if (this.snappedMousePosition !== snapped) {
                                this.updateLocationType();
                                this.updateTmpWireValidity();

                                this.render();
                        }

                        this.snappedMousePosition = snapped;

                        if (this.draggingNode)
                                this.draggingNode.location = this.snappedMousePosition

                        const delta = [mousePosition[0] - this.mousePosition[0], mousePosition[1] - this.mousePosition[1]];
                        this.mousePosition = mousePosition;

                        if (!this.viewportDragging) {
                                this.render();
                                return;
                        }

                        this.viewportPosition[0] += delta[0];
                        this.viewportPosition[1] += delta[1];
                });
        }

}