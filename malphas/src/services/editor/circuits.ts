import {CircuitElement} from "@/services/editor/element.ts";
import type {CircuitRenderer} from "@/services/editor/renderer.ts";
import type {CircuitNode} from "@/services/editor/ast.ts";

export enum CircuitType {
        UNDEFINED = "UNDEFINED",

        /* A fixed input value (0 ins, 1 out) */
        INPUT = "INPUT",

        /* A known output point (1 in, 0 outs) */
        OUTPUT = "OUTPUT",

        /* Regular logic gates */
        AND = "AND",
        OR = "OR",
        NOT = "NOT"
}

function ngon(n: number): number[][] {
        const da = (2 * Math.PI) / n;
        let arr = []
        for (let i = 0; i < n; i++)
                arr.push([Math.cos(da * i), Math.sin(da * i)])
        return arr
}

export class InputCircuit extends CircuitElement {
        override geometry(): number[][] {
                return ngon(20)
        }

        override inputs(): number[][] {
                return [];
        }

        override outputs(): number[][] {
                return [
                        [1, 0]
                ];
        }

        override logic(inputs: boolean[], renderer: CircuitRenderer, node: CircuitNode): boolean {
                const storedState = renderer.inputCircuitStates.get(node.dto.id)
                if (storedState != undefined)
                        return storedState
                const newState = Math.random() < 0.5
                renderer.inputCircuitStates.set(node.dto.id, newState)
                return newState
        }
}

export class OutputCircuit extends CircuitElement {
        override geometry(): number[][] {
                return ngon(20);
        }

        override inputs(): number[][] {
                return [
                        [-1, 0]
                ];
        }

        override outputs(): number[][] {
                return [];
        }

        override logic(inputs: boolean[], renderer: CircuitRenderer, node: CircuitNode): boolean {
                return inputs[0]; // An output mirrors its inputs
        }
}

export class NotCircuit extends CircuitElement {
        override geometry(): number[][] {
                return [
                        [0, 2],
                        [3, 0],
                        [0, -2]
                ];
        }

        override inputs(): number[][] {
                return [
                        [0, 0]
                ];
        }

        override outputs(): number[][] {
                return [
                        [3, 0]
                ];
        }

        override logic(inputs: boolean[], renderer: CircuitRenderer, node: CircuitNode): boolean {
                return !inputs[0];
        }
}

export class OrCircuit extends CircuitElement {
        override geometry(): number[][] {
                return [
                        [0, 2],
                        [3, 0],
                        [0, -2]
                ];
        }

        override inputs(): number[][] {
                return [
                        [0, 1],
                        [0, -1]
                ];
        }

        override outputs(): number[][] {
                return [
                        [3, 0]
                ];
        }

        override logic(inputs: boolean[], renderer: CircuitRenderer, node: CircuitNode): boolean {
                return inputs[0] || inputs[1];
        }
}

export class AndCircuit extends CircuitElement {
        override geometry(): number[][] {
                return [
                        [0, 2],
                        [3, 0],
                        [0, -2]
                ];
        }

        override inputs(): number[][] {
                return [
                        [0, 1],
                        [0, -1]
                ];
        }

        override outputs(): number[][] {
                return [
                        [3, 0]
                ];
        }

        override logic(inputs: boolean[], renderer: CircuitRenderer, node: CircuitNode): boolean {
                return inputs[0] && inputs[1];
        }
}

export const circuitElements = new Map<CircuitType, CircuitElement>([
        [CircuitType.INPUT, new InputCircuit()],
        [CircuitType.OUTPUT, new OutputCircuit()],
        [CircuitType.NOT, new NotCircuit()],
        [CircuitType.OR, new OrCircuit()],
        [CircuitType.AND, new AndCircuit()]
]);

