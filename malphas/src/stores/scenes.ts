import {defineStore} from "pinia";
import type {SceneDto} from "@/api";
import {Api} from '@/services/api.ts';

export const useScenesStore = defineStore("scenes", {
        state: () => ({
                scenes: [] as SceneDto[],
                selectedScene: undefined as SceneDto | undefined,
                loading: false
        }),

        actions: {
                reloadScenes(errorCallback: (err: any) => void) {
                        this.loading = true;
                        Api.scene.listAllScenes().subscribe({
                                next: (scenes: SceneDto[]) => {
                                        this.scenes = scenes;
                                        this.loading = false;
                                },
                                error: (err: any) => {
                                        this.scenes = [];
                                        this.loading = false;
                                        errorCallback(err)
                                }
                        })
                },

                selectScene(scene: SceneDto) {
                        this.selectedScene = scene
                },

                getSelectedScene(): SceneDto | undefined {
                        return this.selectedScene
                }
        }
})