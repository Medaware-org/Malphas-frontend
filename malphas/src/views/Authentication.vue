<script setup lang="ts">
import '@/services/errorParser.ts';
import GoogleLoginButton from "@/components/GoogleLoginButton.vue";
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center" id="background">
    <div class="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
      <div class="card bg-base-200 shadow-2xl">
        <div class="card-body flex flex-col items-center justify-center">
          <h1 class="text-center text-3xl font-semibold mb-4">Authentication</h1>
          <div id="loginBtn" class="mt-3 w-full flex justify-center">
            <GoogleLoginButton class="w-full sm:w-3/4 lg:w-2/3" />
          </div>
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

.card-body {
  padding: 2rem;
}

/* Flexbox centering for the button and content */
.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Add responsive styling for larger screens */
@media (min-width: 768px) {
  .card-body {
    padding: 3rem;
  }
}

@media (max-width: 1000px) {
  #loginBtn {
    scale: 1.35;
  }
}
</style>
