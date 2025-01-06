/**
 * Utilities for constructing an AST from the individual components
 */
import type {CircuitDto, WireDto} from "@/api";
import type {CircuitElement} from "@/services/editor/element.ts";
import {circuitElements} from "@/services/editor/circuits.ts";

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

function circuitTypeFromString(str: string): CircuitType {
        return CircuitType[str as keyof typeof CircuitType] || CircuitType.UNDEFINED;
}

export interface WireNode {
        dto: WireDto,

        /* The output of the source circuit */
        source: [number, CircuitNode],

        /* The input of the target circuit */
        target: [number, CircuitNode],

        /* The path that the wire takes (visually) */
        path: [number, number][];
}

export interface CircuitNode {
        dto: CircuitDto,

        /* World-space location of the circuit */
        location: [number, number],

        /* Input numbers that connect to inbound wires */
        inputs: Map<number, WireNode>,

        /* Output numbers that connect to outbound wires */
        outputs: Map<number, WireNode>

        /* Gate type; defines (visual and logical) characteristics */
        type: CircuitType,

        /* The ruleset for rendering */
        element: CircuitElement
}

/**
 * Convert the DTOs into a coherent, renderable and analysable tree
 */
export function buildTree(circuits: CircuitDto[], wires: WireDto[]): CircuitNode[] | undefined {
        // Map for that sweet O(1) lookup complexity
        const circuitMap: Map<string, CircuitNode> =
                new Map(circuits.map(circuit => [circuit.id, {
                        dto: circuit,
                        location: [circuit.location_x, circuit.location_y],
                        inputs: new Map(), // TODO Update this
                        outputs: new Map(), // TODO Update this
                        type: circuitTypeFromString(circuit.gate_type),
                        element: circuitElements.get(circuitTypeFromString(circuit.gate_type))!!
                }]));

        wires.forEach(wire => {
                const source = circuitMap.get(wire.source_circuit);
                const destination = circuitMap.get(wire.target_circuit);

                if (!source || !destination) {
                        console.log(`Could not build AST: Wire '${wire.id}' points to at least one non-existent circuit.`)
                        return undefined
                }

                const node: WireNode = {
                        dto: wire,
                        source: [wire.number_input, source],
                        target: [wire.number_output, destination],
                        path: []
                }

                source.outputs.set(wire.number_input, node)
                destination.inputs.set(wire.number_output, node)
        })

        // TODO Design check: Check if input and output indices are in range, check if all connections are populated

        // Find the output nodes
        const outputs = Array.from(circuitMap.values()).filter(circuit => circuit.outputs.size == 0)

        console.log("AST Construction successful.")

        return outputs
}
