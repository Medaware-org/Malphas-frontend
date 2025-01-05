<script setup lang="ts">

import {ref, computed, onMounted} from 'vue';
import {useSessionStore} from "@/stores/session.ts";
import router from "@/router";
import {Api} from "@/services/api.ts";
import {ExclamationCircleIcon} from '@heroicons/vue/24/outline';
import '@/services/errorParser.ts';
import type {TokenDto} from "@/api";
import retrieveErrorDto from "@/services/errorParser.ts";

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
    next: (token: TokenDto) => {
      sessionStore.setToken(token.token)
      router.push("/dash")
    },
    error(err: any) {
      errorMessage.value = retrieveErrorDto(err).description;
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
      errorMessage.value = retrieveErrorDto(err).description;
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
        <ExclamationCircleIcon class="size-6"></ExclamationCircleIcon>
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