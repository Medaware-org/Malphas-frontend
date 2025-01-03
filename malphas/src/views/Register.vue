<script setup lang="ts">

import {ref, computed, onMounted} from 'vue';
import {Api} from '../services/api.ts';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";

const sessionStore = useSessionStore()
const errorBanner = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')

const isFormValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0;
});

onMounted(() => {
  if (sessionStore.getToken()) {
    router.push("/dash");
    return;
  }
})

function register() {
  errorBanner.value = false;

  Api.auth.register({
    credentialsDto: {
      username: username.value,
      password: password.value,
    }
  }).subscribe({
    next: () => {
      router.push("/login");
    },
    error(err: any) {
      error.value = err?.response?.description || "An unknown error occurred"
      errorBanner.value = true;
    }
  })
}

</script>

<template>
  <div class="w-full h-screen flex items-center justify-center" id="background">
    <div class="sm:w-full xl:w-1/4">
      <div class="card bg-base-200 shadow-2xl">
        <form @submit.prevent="register">
          <div class="card-body">
            <h2 class="card-title mb-5">Register</h2>
            <input type="text" placeholder="Username" class="input input-bordered" v-model="username">
            <input type="password" placeholder="Password" class="input input-bordered mt-2" v-model="password">
            <button :disabled="!isFormValid" type="submit" class="btn btn-primary mt-5">Register</button>
          </div>
        </form>
      </div>
      <div role="alert" class="alert alert-error mt-5" v-if="errorBanner">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24">
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ error }}</span>
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