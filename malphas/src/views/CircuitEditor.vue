<script setup lang="ts">

import Viewport from "@/components/Viewport.vue";

import {onMounted, ref} from 'vue';

import {ArrowsPointingInIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, HomeIcon} from "@heroicons/vue/24/outline";
import router from "@/router";
import {useScenesStore} from "@/stores/scenes.ts";

const viewportRef = ref<InstanceType<typeof Viewport> | null>(null);
const sceneStore = useScenesStore();

onMounted(() => {
  // No scene is selected, so there's nothing the viewport can do
  if (!sceneStore.getSelectedScene())
    router.push("/dash")
})

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

const returnToDashboard = () => {
  router.push("/dash");
};

</script>

<template>
  <Viewport ref="viewportRef"></Viewport>
  <div id="button-overlay">
    <div class="m-8 pointer-events-auto xl:flex-col flex-row" id="button-container">
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Return to Dashboard">
        <button class="btn btn-primary btn-circle" @click="returnToDashboard">
          <HomeIcon class="size-7 inline"></HomeIcon>
        </button>
      </div>
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Center View">
        <button class="btn btn-primary btn-circle" @click="recenterViewport">
          <ArrowsPointingInIcon class="size-7 inline"></ArrowsPointingInIcon>
        </button>
      </div>
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Zoom In">
        <button class="btn btn-primary btn-circle" @click="zoomInViewport">
          <MagnifyingGlassPlusIcon class="size-7 inline"></MagnifyingGlassPlusIcon>
        </button>
      </div>
      <div class="tooltip xl:tooltip-right tooltip-bottom" data-tip="Zoom Out">
        <button class="btn btn-primary btn-circle" @click="zoomOutViewport">
          <MagnifyingGlassMinusIcon class="size-7 inline"></MagnifyingGlassMinusIcon>
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