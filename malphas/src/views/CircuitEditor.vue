<script setup lang="ts">

import Viewport from "@/components/Viewport.vue";

import {ref} from 'vue';

const viewportRef = ref<InstanceType<typeof Viewport> | null>(null);

const recenterViewport = () => {
  if (viewportRef.value)
    viewportRef.value.recenter();
};

</script>

<template>
  <Viewport ref="viewportRef"></Viewport>
  <div id="button-overlay">
    <div class="m-8 pointer-events-auto">
      <button class="btn btn-secondary text-6xl" @click="recenterViewport">
        <i class="fas fa-arrows"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
#button-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}
</style>