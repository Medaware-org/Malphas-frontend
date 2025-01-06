<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {CircuitRenderer} from "@/services/editor/renderer.ts";
import type {CircuitType} from "@/services/editor/circuits.ts";

const canvas = ref<HTMLCanvasElement | undefined>(undefined);
const renderer = ref<CircuitRenderer | undefined>(undefined);

// Instantiate the renderer
onMounted(() => {
  const canvasElement = canvas.value!!;
  const context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
  renderer.value = new CircuitRenderer(canvasElement, context);
})

defineExpose({
  recenter: () => {
    renderer.value!!.centerView();
  },
  zoomIn: () => {
    renderer.value!!.zoomIn();
  },
  zoomOut: () => {
    renderer.value!!.zoomOut();
  },
  addGate(type: string) {
    renderer.value!!.addGate(type);
  }
})

</script>

<template>
  <canvas class="select-none" ref="canvas" id="canvas"></canvas>
</template>

<style scoped>
#canvas {
  position: fixed;
  top: 0;
  left: 0;
  cursor: none;
}
</style>