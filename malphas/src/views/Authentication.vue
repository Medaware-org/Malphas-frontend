<script setup lang="ts">

import '@/services/errorParser.ts';
import GoogleLoginButton from "@/components/GoogleLoginButton.vue";

</script>

<template>
  <div class="w-full h-screen flex items-center justify-center" id="background">
    <div class="sm:w-full xl:w-1/4">
      <div class="card bg-base-200 shadow-2xl">
        <div class="card-body">
          <h1>Authentication</h1>
          <div class="mt-3"></div>
          <GoogleLoginButton></GoogleLoginButton>
        </div>
      </div>
    </div>
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