<script setup lang="ts">

import {PlusIcon, ArrowPathIcon, ArrowRightStartOnRectangleIcon} from '@heroicons/vue/24/solid';

import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {onMounted} from "vue";
import {useScenesStore} from "@/stores/scenes.ts";
import LoadingIndicator from "@/components/LoadingIndicator.vue";

const sessionStore = useSessionStore();
const sceneStore = useScenesStore();

onMounted(() => {
  sceneStore.reloadScenes();
});

function signOut() {
  sessionStore.forgetToken();
  router.push("/auth");
}

</script>

<template>
  <div class="navbar bg-primary shadow-xl mb-10" id="nav">
    <div class="navbar-start">
      <span class="px-3 text-slate-200 roboto-regular text-xl select-none">Dashboard</span>
    </div>
    <div class="navbar-end">
      <ArrowRightStartOnRectangleIcon @click="signOut" class="size-5 mr-5 text-white"></ArrowRightStartOnRectangleIcon>
    </div>
  </div>
  <LoadingIndicator v-if="sceneStore.loading"></LoadingIndicator>
  <div class="flex flex-row gap-5 mx-10" v-if="!sceneStore.loading">
    <!-- The scene creation card -->
    <div class="card w-72 bg-neutral-900 hover:bg-neutral-700 border-slate-400 border-solid border new-scene-card">
      <div class="card-body flex items-center justify-center">
        <PlusIcon class="size-10"></PlusIcon>
      </div>
    </div>

    <!-- Scene cards -->
    <div class="card w-72 bg-neutral-900 border-slate-400 border-solid border"
         v-for="scene in sceneStore.scenes">
      <div class="card-body">
        <h2 class="card-title">
          {{ scene.name }}
        </h2>
        <p>{{ scene.description }}</p>
        <div class="card-actions justify-end mt-2">
          <button class="btn btn-primary">Edit</button>
        </div>
      </div>
    </div>

    <!-- Reload card -->
    <div class="card w-72 bg-neutral-900 hover:bg-neutral-700 border-slate-400 border-solid border new-scene-card">
      <div class="card-body flex items-center justify-center">
        <ArrowPathIcon class="size-10"></ArrowPathIcon>
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