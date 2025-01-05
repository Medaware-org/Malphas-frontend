<script setup lang="ts">

import {
  PlusIcon,
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  Cog8ToothIcon, ExclamationCircleIcon
} from '@heroicons/vue/24/outline';
import {computed, ref} from 'vue';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {onMounted} from "vue";
import {useScenesStore} from "@/stores/scenes.ts";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {Api} from "@/services/api.ts";
import '@/services/errorParser.ts';
import type {SceneDto} from "@/api";
import retrieveErrorDto from "@/services/errorParser.ts";

onMounted(() => {
  reloadScenes();
});

const sessionStore = useSessionStore();
const sceneStore = useScenesStore();

const createSceneDialog = ref<HTMLDialogElement>()
const updateSceneDialog = ref<HTMLDialogElement>()
const newSceneName = ref('')                // } We're using the same model fields for both the create
const newSceneDescription = ref('')         // } and edit dialogues

const deleteSceneDialog = ref<HTMLDialogElement>()
const targetScene = ref<SceneDto | undefined>(undefined) // Both for deleting and updating

const errorOccurred = ref(false)
const errorMessage = ref('')

function error(message: string) {
  errorMessage.value = message;
  errorOccurred.value = true;
}

function clearError() {
  errorOccurred.value = false;
}

function signOut() {
  sessionStore.forgetToken();
  router.push("/auth");
}

const isCreateOrUpdateFormValid = computed(() => {
  return newSceneName.value.length > 0 && newSceneDescription.value.length > 0
})

function reloadScenes() {
  clearError();
  sceneStore.reloadScenes((err) => {
    error(retrieveErrorDto(err).description)
  });
}

function clearFormModel() {
  newSceneName.value = ""
  newSceneDescription.value = ""
}

function showCreationDialog() {
  clearFormModel()
  createSceneDialog.value!!.showModal()
}

function showDeleteDialog(scene: SceneDto) {
  targetScene.value = scene
  deleteSceneDialog.value!!.showModal()
}

function showUpdateDialog(scene: SceneDto) {
  clearFormModel()
  targetScene.value = scene
  updateSceneDialog.value!!.showModal()
}

function deleteScene(shouldDelete: boolean) {
  deleteSceneDialog.value!!.close();

  if (!shouldDelete)
    return;

  Api.scene.deleteScene({
    id: targetScene.value!!.id
  }).subscribe({
    next: () => {
      reloadScenes();
    },
    error: (err: any) => {
      error(retrieveErrorDto(err).description)
    }
  })
}

function createScene(shouldCreate: boolean) {
  createSceneDialog.value!!.close();

  if (!shouldCreate)
    return;

  Api.scene.createScene({
    sceneCreationDto: {
      name: newSceneName.value,
      description: newSceneDescription.value
    }
  }).subscribe({
    next: () => {
      reloadScenes();
    },
    error: (err: any) => {
      error(retrieveErrorDto(err).description)
    }
  })
}

function updateScene(shouldUpdate: boolean) {
  updateSceneDialog.value!!.close();

  if (!shouldUpdate)
    return;

  Api.scene.updateScene({
    sceneUpdateDto: {
      id: targetScene.value!!.id,
      name: newSceneName.value,
      description: newSceneDescription.value
    }
  }).subscribe({
    next: () => {
      reloadScenes();
    },
    error: (err: any) => {
      error(retrieveErrorDto(err).description)
    }
  })
}

function openInEditor(scene: SceneDto) {
  sceneStore.selectScene(scene)
  router.push("/editor")
}

</script>

<template>
  <!-- New Scene Dialog -->
  <dialog id="new_scene" class="modal" ref="createSceneDialog">
    <div class="modal-box">
      <form method="dialog" @submit.prevent="createScene(true)">
        <h2 class="text-lg font-bold">Create Scene</h2>
        <div class="flex flex-col gap-5 mt-5">
          <input type="text" class="input input-bordered" placeholder="Scene Name" v-model="newSceneName">
          <input type="text" class="input input-bordered" placeholder="Description" v-model="newSceneDescription">
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="createScene(false)">Cancel</button>
          <button class="btn" type="submit" :disabled="!isCreateOrUpdateFormValid">Create</button>
        </div>
      </form>
    </div>
  </dialog>

  <!-- Scene Edit Dialog -->
  <dialog id="new_scene" class="modal" ref="updateSceneDialog">
    <div class="modal-box">
      <form method="dialog" @submit.prevent="updateScene(true)">
        <h2 class="text-lg font-bold">Edit Scene Details</h2>
        <div class="flex flex-col gap-5 mt-5">
          <input type="text" class="input input-bordered" placeholder="New Name" v-model="newSceneName">
          <input type="text" class="input input-bordered" placeholder="New Description" v-model="newSceneDescription">
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" type="button" @click="updateScene(false)">Cancel</button>
          <button class="btn" type="submit" :disabled="!isCreateOrUpdateFormValid">Update</button>
        </div>
      </form>
    </div>
  </dialog>

  <!-- Delete Scene Confirm Dialog -->
  <dialog id="new_scene" class="modal" ref="deleteSceneDialog">
    <div class="modal-box">
      <h2 class="text-lg font-bold">Delete Scene?</h2>
      <span>Are you sure that you want to delete the scene <span class="italic">{{ targetScene?.name }}</span> and all of its internal circuitry?</span>
      <div class="modal-action">
        <button class="btn btn-ghost" type="button" @click="deleteScene(false)">Cancel</button>
        <button class="btn" type="button" @click="deleteScene(true)">Delete</button>
      </div>
    </div>
  </dialog>

  <div class="navbar bg-primary shadow-xl mb-10" id="nav">
    <div class="navbar-start">
      <span class="px-3 text-slate-200 roboto-light text-xl select-none">Dashboard</span>
    </div>
    <div class="navbar-end">
      <ArrowRightStartOnRectangleIcon @click="signOut" class="size-5 mr-5 text-white"></ArrowRightStartOnRectangleIcon>
    </div>
  </div>

  <div class="prose mx-10 mb-10" v-if="!sceneStore.loading">
    <h1>Scenes</h1>
  </div>

  <div class="flex flex-row justify-center items-center mt-5 mb-5" v-if="errorOccurred">
    <div class="w-1/2">
      <div role="alert" class="alert alert-error">
        <ExclamationCircleIcon class="size-6"></ExclamationCircleIcon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>

  <LoadingIndicator v-if="sceneStore.loading"></LoadingIndicator>

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
        @click="showCreationDialog"
        v-if="!errorOccurred">
      <div class="card-body flex items-center justify-center">
        <PlusIcon class="size-10"></PlusIcon>
        <span>New Scene</span>
      </div>
    </div>

    <!-- Scene cards -->
    <div class="card min-w-72 h-48 bg-neutral-900 border-slate-400 border-solid border"
         v-for="scene in sceneStore.scenes"
         v-if="!errorOccurred">
      <div class="card-body">
        <h2 class="card-title">
          {{ scene.name }}
        </h2>
        <p>{{ scene.description }}</p>
        <div class="card-actions mt-5">
          <div class="tooltip flex-1 tooltip-bottom" data-tip="Delete Scene" @click="showDeleteDialog(scene)">
            <button class="btn btn-error w-full btn-outline">
              <TrashIcon class="size-5 inline"></TrashIcon>
            </button>
          </div>
          <div class="tooltip flex-1 tooltip-bottom" data-tip="Edit Details" @click="showUpdateDialog(scene)">
            <button class="btn btn-accent w-full btn-outline">
              <Cog8ToothIcon class="size-5 inline"></Cog8ToothIcon>
            </button>
          </div>
          <div class="tooltip flex-1 tooltip-bottom" data-tip="Open in Editor" @click="openInEditor(scene)">
            <button class="btn btn-info w-full btn-outline">
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