import {CircuitElement} from "@/services/editor/element.ts";
import {CircuitType} from "@/services/editor/ast.ts";

export class InputCircuit extends CircuitElement {
        override geometry(): number[][] {
                const da = (2 * Math.PI) / 8;
                return [
                        [Math.cos(da), Math.sin(da)],
                        [Math.cos(da * 2), Math.sin(da * 2)],
                        [Math.cos(da * 3), Math.sin(da * 3)],
                        [Math.cos(da * 4), Math.sin(da * 4)],
                        [Math.cos(da * 5), Math.sin(da * 5)],
                        [Math.cos(da * 6), Math.sin(da * 6)],
                        [Math.cos(da * 7), Math.sin(da * 7)],
                        [Math.cos(da * 8), Math.sin(da * 8)]
                ];
        }

        override inputs(): number[][] {
                return [];
        }

        override outputs(): number[][] {
                return [
                        [1, 0]
                ];
        }

}

export class OutputCircuit extends CircuitElement {
        override geometry(): number[][] {
                const da = (2 * Math.PI) / 8;
                return [
                        [Math.cos(da), Math.sin(da)],
                        [Math.cos(da * 2), Math.sin(da * 2)],
                        [Math.cos(da * 3), Math.sin(da * 3)],
                        [Math.cos(da * 4), Math.sin(da * 4)],
                        [Math.cos(da * 5), Math.sin(da * 5)],
                        [Math.cos(da * 6), Math.sin(da * 6)],
                        [Math.cos(da * 7), Math.sin(da * 7)],
                        [Math.cos(da * 8), Math.sin(da * 8)]
                ];
        }

        override inputs(): number[][] {
                return [
                        [-1, 0]
                ];
        }

        override outputs(): number[][] {
                return [];
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

}

export const circuitElements = new Map<CircuitType, CircuitElement>([
        [CircuitType.INPUT, new InputCircuit()],
        [CircuitType.OUTPUT, new OutputCircuit()],
        [CircuitType.NOT, new NotCircuit()]
]);

