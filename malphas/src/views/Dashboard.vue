<script setup lang="ts">

import {
  PlusIcon,
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';
import {computed, ref} from 'vue';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {onMounted} from "vue";
import {useScenesStore} from "@/stores/scenes.ts";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {Api} from "@/services/api.ts";

const sessionStore = useSessionStore();
const sceneStore = useScenesStore();

const createSceneDialog = ref(null);

const newSceneName = ref('')
const newSceneDescription = ref('')

onMounted(() => {
  reloadScenes();
});

const isCreationFormValid = computed(() => {
  return newSceneName.value.length > 0 && newSceneDescription.value.length > 0
})

function signOut() {
  sessionStore.forgetToken();
  router.push("/auth");
}

function reloadScenes() {
  sceneStore.reloadScenes();
}

function showCreationDialog() {
  if (!createSceneDialog.value)
    return;
  (createSceneDialog.value!! as HTMLDialogElement).showModal();
}

function hideCreationDialog() {
  if (!createSceneDialog.value)
    return;
  (createSceneDialog.value!! as HTMLDialogElement).close();
}

function createScene() {
  hideCreationDialog();
  Api.scene.createScene({
    sceneCreationDto: {
      name: newSceneName.value,
      description: newSceneDescription.value
    }
  }).subscribe({
    next: () => {
      reloadScenes();
    },
    error: (err) => {
      // TODO Show error feedback
    }
  })
}

</script>

<template>
  <!-- New Scene Dialog -->
  <dialog id="new_scene" class="modal" ref="createSceneDialog">
    <div class="modal-box">
      <form method="dialog" @submit.prevent="createScene">
        <h2 class="text-lg font-bold">Create Scene</h2>
        <div class="flex flex-col gap-5 mt-5">
          <input type="text" class="input input-bordered" placeholder="Scene Name" v-model="newSceneName">
          <input type="text" class="input input-bordered" placeholder="Description" v-model="newSceneDescription">
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="hideCreationDialog">Cancel</button>
          <button class="btn" type="submit" :disabled="!isCreationFormValid">Create</button>
        </div>
      </form>
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
        class="card min-w-72 h-48 select-none bg-neutral-900 hover:bg-neutral-700 border-slate-400 border-solid border new-scene-card"
        @click="showCreationDialog">
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