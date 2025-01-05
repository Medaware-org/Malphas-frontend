import {defineStore} from "pinia";
import type {SceneDto} from "@/api";
import {Api} from '@/services/api.ts';

export const useScenesStore = defineStore("scenes", {
        state: () => ({scenes: [] as SceneDto[]}),

        actions: {
                reloadScenes() {
                        Api.scene.listAllScenes().subscribe({
                                next: (scenes: SceneDto[]) => {
                                        this.scenes = scenes;
                                },
                                error: (err) => {
                                        this.scenes = [];
                                }
                        })
                }
        }
})