import {defineStore} from "pinia";
import type {SceneDto} from "@/api";
import {Api} from '@/services/api.ts';

export const useScenesStore = defineStore("scenes", {
        state: () => ({scenes: [] as SceneDto[], loading: false}),

        actions: {
                reloadScenes() {
                        this.loading = true;
                        Api.scene.listAllScenes().subscribe({
                                next: (scenes: SceneDto[]) => {
                                        this.scenes = scenes;
                                        this.loading = false;
                                },
                                error: (err) => {
                                        this.scenes = [];
                                        this.loading = false;
                                }
                        })
                }
        }
})