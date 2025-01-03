<script setup lang="ts">

import {ref, computed, onMounted} from 'vue';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {Api} from "@/services/api.ts";

const sessionStore = useSessionStore()

const errorOccurred = ref(false)
const errorMessage = ref('')

const username = ref('')
const password = ref('')

const state = ref<'login' | 'register'>('login')

const isFormValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0;
});

onMounted(() => {
  if (sessionStore.getToken())
    router.push("/dash");
})

function login() {
  errorOccurred.value = false;

  Api.auth.login({
    credentialsDto: {
      username: username.value,
      password: password.value,
    }
  }).subscribe({
    next: (token: string) => {
      sessionStore.setToken(token);
      router.push("/dash");
    },
    error(err: any) {
      errorMessage.value = err?.response?.description || "An unknown error occurred"
      errorOccurred.value = true;
    }
  })
}

function register() {
  errorOccurred.value = false;

  Api.auth.register({
    credentialsDto: {
      username: username.value,
      password: password.value,
    }
  }).subscribe({
    next: () => {
      state.value = 'login'
      cleanup();
    },
    error(err: any) {
      errorMessage.value = err?.response?.description || "An unknown error occurred"
      errorOccurred.value = true;
    }
  })
}

/**
 * Log-In or Register based on the state
 */
function act() {
  if (state.value == 'login')
    login();
  else
    register();
}

function cleanup() {
  username.value = "";
  password.value = "";
  errorOccurred.value = false;
}

</script>

<template>
  <div class="w-full h-screen flex items-center justify-center" id="background">
    <div class="sm:w-full xl:w-1/4">
      <div class="card bg-base-200 shadow-2xl">
        <div class="card-body">
          <form @submit.prevent="act">
            <div class="flex flex-col justify-start gap-5">
              <div class="flex flex-row justify-start items-center gap-4">
                <input type="radio" v-model="state" value="login" @change="cleanup" aria-label="Log In"
                       class="btn"
                       name="mode"
                       checked>
                <input type="radio" v-model="state" value="register" @change="cleanup" aria-label="Register"
                       class="btn"
                       name="mode">
              </div>
              <input type="text" v-model="username" class="input input-bordered" placeholder="Username">
              <input type="text" v-model="password" class="input input-bordered" placeholder="Password">
              <button class="btn btn-accent" type="submit">
                {{ state == 'login' ? 'Log In' : 'Register' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div role="alert" class="alert alert-error mt-5" v-if="errorOccurred">
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
        <span>{{ errorMessage }}</span>
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