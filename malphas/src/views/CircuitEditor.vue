<script setup lang="ts">

import Viewport from "@/components/Viewport.vue";

import {ref} from 'vue';

const viewportRef = ref<InstanceType<typeof Viewport> | null>(null);

const recenterViewport = () => {
  if (viewportRef.value)
    viewportRef.value.recenter();
};

const zoomInViewport = () => {
  if (viewportRef.value)
    viewportRef.value.zoomIn();
};

const zoomOutViewport = () => {
  if (viewportRef.value)
    viewportRef.value.zoomOut();
};

</script>

<template>
  <Viewport ref="viewportRef"></Viewport>
  <div id="button-overlay">
    <div class="m-8 pointer-events-auto" id="button-container">
      <button class="btn btn-primary text-6xl" @click="recenterViewport">
        <i class="fas fa-arrows text-xl"></i>
      </button>
      <button class="btn btn-primary" @click="zoomInViewport">
        <i class="fas fa-plus text-xl"></i>
      </button>
      <button class="btn btn-primary" @click="zoomOutViewport">
        <i class="fas fa-minus text-xl"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
#button-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 100%;
  pointer-events: none;
}

#button-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: start;
  justify-content: center;
}

.btn {
  display: block;
}
</style>