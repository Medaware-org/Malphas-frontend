import {defineStore} from "pinia";
import type {CircuitDto, ErrorDto, SceneDto, WireDto} from "@/api";
import {Api} from "@/services/api.ts";
import '@/services/editor/ast.ts';
import {buildTree, type CircuitNode} from "@/services/editor/ast.ts";

export const useComponentsStore = defineStore("components", {
        state: () => ({
                loading: false,
                wires: [] as WireDto[],
                circuits: [] as CircuitDto[],
                ast: [] as CircuitNode[],
        }),

        actions: {
                isLoading(): boolean {
                        return this.loading;
                },

                loadWiresAndCircuits(scene: SceneDto, errorCallback: (err: any) => void, then: () => void): void {
                        this.loading = true

                        const loadCircuits = () => {
                                Api.circuit.listAllCircuits({
                                        scene: scene.id
                                }).subscribe({
                                        next: (circuits: CircuitDto[]) => {
                                                this.circuits = circuits
                                                console.log(`Loaded ${circuits.length} circuits.`)
                                                then()
                                                this.loading = false
                                        },
                                        error: (err: any) => {
                                                this.circuits = []
                                                this.loading = false
                                                errorCallback(err)
                                        }
                                })
                        }

                        Api.wire.listAllWires({
                                scene: scene.id
                        }).subscribe({
                                next: (wires: WireDto[]) => {
                                        this.wires = wires;
                                        console.log(`Loaded ${wires.length} wires.`)
                                        loadCircuits()
                                },
                                error: (err: any) => {
                                        this.wires = []
                                        this.loading = false
                                        errorCallback(err)
                                }
                        })
                },

                buildAst(onError: (error: ErrorDto) => void): void {
                        this.ast = []

                        if (this.circuits.length == 0 || this.wires.length == 0) {
                                console.log("This scene is empty. AST will not be built.")
                                return;
                        }

                        const tree = buildTree(this.circuits, this.wires);

                        if (!tree) {
                                this.ast = []
                                onError({
                                        summary: "Could not build AST",
                                        description: "An error occurred when attempting to build AST"
                                })
                                return;
                        }

                        this.ast = tree!!
                }
        }
})