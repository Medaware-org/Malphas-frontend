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
    <div class="m-8 pointer-events-auto xl:flex-col flex-row" id="button-container">
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Center View">
        <button class="btn btn-primary btn-circle" @click="recenterViewport">
          <i class="fas fa-arrows text-2xl"></i>
        </button>
      </div>
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Zoom In">
        <button class="btn btn-primary btn-circle" @click="zoomInViewport">
          <i class="fas fa-plus text-2xl"></i>
        </button>
      </div>
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Zoom Out">
        <button class="btn btn-primary btn-circle" @click="zoomOutViewport">
          <i class="fas fa-minus text-2xl"></i>
        </button>
      </div>
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
  gap: 20px;
  align-items: start;
  justify-content: center;
}

.btn {
  display: block;
}
</style>