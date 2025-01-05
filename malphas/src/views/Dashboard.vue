<script setup lang="ts">

import {
  PlusIcon,
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';
import {ref} from 'vue';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {onMounted} from "vue";
import {useScenesStore} from "@/stores/scenes.ts";
import LoadingIndicator from "@/components/LoadingIndicator.vue";

const sessionStore = useSessionStore();
const sceneStore = useScenesStore();

const createSceneDialog = ref(null);

onMounted(() => {
  reloadScenes();
});

function signOut() {
  sessionStore.forgetToken();
  router.push("/auth");
}

function reloadScenes() {
  sceneStore.reloadScenes();
}

</script>

<template>
  <!-- New Scene Dialog -->
  <dialog id="new_scene" class="modal" ref="createSceneDialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Hello!</h3>
      <p class="py-4">Press ESC key or click the button below to close</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>

  <div class="navbar bg-primary shadow-xl mb-10" id="nav">
    <div class="navbar-start">
      <span class="px-3 text-slate-200 roboto-regular text-xl select-none">Dashboard</span>
    </div>
    <div class="navbar-end">
      <ArrowRightStartOnRectangleIcon @click="signOut" class="size-5 mr-5 text-white"></ArrowRightStartOnRectangleIcon>
    </div>
  </div>
  <LoadingIndicator v-if="sceneStore.loading"></LoadingIndicator>
  <div class="prose mx-10 mb-10" v-if="!sceneStore.loading">
    <h1>Scenes</h1>
  </div>
  <div class="flex flex-row lg:justify-start justify-center gap-10 mx-10 flex-wrap" v-if="!sceneStore.loading">
    <!-- Reload card -->
    <div
        class="card min-w-72 h-48 select-none bg-neutral-900 hover:bg-neutral-700 border-slate-400 border-solid border new-scene-card"
        @click="reloadScenes">
      <div class="card-body flex items-center justify-center">
        <ArrowPathIcon class="size-10"></ArrowPathIcon>
        <span>Reload</span>
      </div>
    </div>

    <!-- The scene creation card -->
    <div
        class="card min-w-72 h-48 select-none bg-neutral-900 hover:bg-neutral-700 border-slate-400 border-solid border new-scene-card">
      <div class="card-body flex items-center justify-center">
        <PlusIcon class="size-10"></PlusIcon>
        <span>New Scene</span>
      </div>
    </div>

    <!-- Scene cards -->
    <div class="card min-w-72 h-48 bg-neutral-900 border-slate-400 border-solid border"
         v-for="scene in sceneStore.scenes">
      <div class="card-body">
        <h2 class="card-title">
          {{ scene.name }}
        </h2>
        <p>{{ scene.description }}</p>
        <div class="card-actions mt-5">
          <div class="tooltip flex-1 tooltip-bottom" data-tip="Delete Scene">
            <button class="btn btn-error w-full btn-outline text-error">
              <TrashIcon class="size-5 inline"></TrashIcon>
            </button>
          </div>
          <div class="tooltip flex-1 tooltip-bottom" data-tip="Open in Editor">
            <button class="btn btn-accent w-full btn-outline text-accent">
              <PencilIcon class="size-5 inline"></PencilIcon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.new-scene-card {
  cursor: pointer;
  transition: .2s;
}

.new-scene-card:hover {
  transform: scale(105%);
}
</style>