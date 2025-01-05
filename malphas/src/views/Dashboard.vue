<script setup lang="ts">

import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {onMounted} from "vue";
import {useScenesStore} from "@/stores/scenes.ts";

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
  <div class="navbar bg-primary text-neutral-content shadow-xl" id="nav">
    <div class="navbar-start">
      <span class="px-3 text-slate-200 roboto-regular text-xl select-none">Dashboard</span>
    </div>
    <div class="navbar-end">
      <i class="fas fa-sign-out text-xl text-white mr-5 cursor-pointer" @click="signOut"></i>
    </div>
  </div>
  <div class="flex flex-row gap-5">
    <div class="card" v-for="scene in sceneStore.scenes">
      <div class="card-body">
        <h2 class="card-title">
          {{ scene.name }}
        </h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>