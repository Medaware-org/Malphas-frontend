<script setup lang="ts">

import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";

const sessionStore = useSessionStore();

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
</template>

<style scoped>
</style>