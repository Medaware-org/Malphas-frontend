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
                        inputs: new Map(),
                        outputs: new Map(),
                        type: circuitTypeFromString(circuit.gate_type),
                        element: circuitElements.get(circuitTypeFromString(circuit.gate_type))!!
                }]));

        for (const wire of wires) {
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
        }

        // Check if all connections are populated, check if input and output numbers are in range
        for (const circuit of circuitMap.values()) {
                const element = circuit.element
                const inputCount = circuit.inputs.size
                const outputCount = circuit.outputs.size
                const expectedInputCount = element.inputs().length
                const expectedOutputCount = element.outputs().length

                if (inputCount != expectedInputCount || outputCount != expectedOutputCount) {
                        console.log(`AST Sanity check failed: The connections of circuit '${circuit.dto.id}' are not fully satisfied.`)
                        return undefined
                }

                for (const key of circuit.outputs.keys()) {
                        if (key < 0 || key >= expectedOutputCount) {
                                console.log(`AST Sanity check failed: An outbound connection to circuit '${circuit.dto.id}' is out of bounds (${key}).`)
                                return undefined;
                        }
                }

                for (const key of circuit.inputs.keys()) {
                        if (key < 0 || key >= expectedInputCount) {
                                console.log(`AST Sanity check failed: An inbound connection to circuit '${circuit.dto.id}' is out of bounds (${key}).`)
                                return undefined;
                        }
                }
        }

        console.log("AST Sanity check OK.")

        // Find the output nodes
        const outputs = Array.from(circuitMap.values()).filter(circuit => circuit.outputs.size == 0)

        console.log("AST Construction successful.")

        return outputs
}

export function traverseAllAsts(tree: CircuitNode[], func: (node: CircuitNode | WireNode) => void) {
        tree.forEach(node => traverseAst(node, func))
}

export function traverseAst(tree: CircuitNode | WireNode, func: (node: CircuitNode | WireNode) => void) {
        /* CircuitNode */
        if ('inputs' in tree && 'outputs' in tree) {
                func(tree)
                const inputs = tree.inputs; // We're traversing the tree from the outputs to the inputs (in reverse)
                inputs.forEach((value, key) => {
                        traverseAst(value, func);
                })
                return;
        }

        /* WireNode */
        if ('source' in tree && 'target' in tree) {
                func(tree)
                const source = tree.source[1]; // `source` is the wire's `input`
                traverseAst(source, func);
                return;
        }
}
