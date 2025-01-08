<script setup lang="ts">
import {HomeIcon} from "@heroicons/vue/24/outline";
import router from "@/router";

const home = () => {
  router.push("/auth")
}

</script>

<template>
  <div class="w-full h-screen bg-neutral flex flex-col items-center justify-center gap-6" id="background">
    <span class="text-white text-5xl">Page Not Found</span>
    <button class="btn btn-primary" @click="home">
      <HomeIcon class="inline size-5"></HomeIcon>
      Home
    </button>
  </div>
</template>

<style scoped>
#background {
  background-image: url('../assets/img/background.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>