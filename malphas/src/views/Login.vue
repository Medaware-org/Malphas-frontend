<script setup lang="ts">

import {ref, computed} from 'vue';
import {Api} from '../services/api.ts';

const invalidCredentials = ref(false)
const username = ref('')
const password = ref('')

const isFormValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0;
});

function login() {
  Api.auth.login({
    username: username.value,
    password: password.value,
  });
}

</script>

<template>
  <div class="w-full h-screen flex items-center justify-center" id="background">
    <div class="card bg-base-200 xl:w-1/4 sm:w-full shadow-2xl">
      <form>
        <div class="card-body">
          <input type="text" placeholder="Username" class="input input-bordered" v-model="username">
          <input type="password" placeholder="Password" class="input input-bordered mt-2" v-model="password">
          <div role="alert" class="alert alert-error mt-5" v-if="invalidCredentials">
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
            <span>Invalid credentials</span>
          </div>
          <button :disabled="!isFormValid" type="submit" class="btn btn-primary mt-5">Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
#background {
  background-image: url('../assets/img/background.png');
}
</style>