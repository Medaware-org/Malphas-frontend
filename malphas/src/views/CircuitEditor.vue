<script setup lang="ts">

import Viewport from "@/components/Viewport.vue";

import {onMounted, ref} from 'vue';

import {
  ArrowsPointingInIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon
} from "@heroicons/vue/24/outline";
import router from "@/router";
import {useScenesStore} from "@/stores/scenes.ts";
import {useComponentsStore} from "@/stores/components.ts";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import retrieveErrorDto from "@/services/errorParser.ts";
import type {ErrorDto} from "@/api";
import {type CircuitType} from "@/services/editor/circuits.ts";

const viewportRef = ref<InstanceType<typeof Viewport> | null>(null);
const sceneStore = useScenesStore();
const componentStore = useComponentsStore();

const errorMessage = ref('')
const errorOccurred = ref(false)
const addGateDialog = ref<HTMLDialogElement>()

onMounted(() => {
  // No scene is selected, so there's nothing the viewport can do
  if (!sceneStore.getSelectedScene()) {
    router.push("/dash")
    return
  }

  componentStore.loadWiresAndCircuits(sceneStore.getSelectedScene()!!, (err) => {
    errorMessage.value = retrieveErrorDto(err).summary
    errorOccurred.value = true
  }, () => {
    componentStore.buildAst((error: ErrorDto) => {
      errorMessage.value = error.summary
      errorOccurred.value = true
    })
  })

  window.addEventListener("keydown", (evt: KeyboardEvent) => {
    if (evt.key == "a") {
      addGateDialog.value!!.showModal();
    }
  })
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

const addCircuit = (type: string) => {
  addGateDialog.value!!.close();
  viewportRef.value!!.addGate(type)
}

</script>

<template>
  <dialog id="add_gate" ref="addGateDialog" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Add Circuit</h3>
      <div class="flex flex-row items-center justify-center w-full gap-3 mt-5 h-20">
        <button class="btn btn-primary flex-1" @click="addCircuit('AND')">AND</button>
        <button class="btn btn-primary flex-1" @click="addCircuit('OR')">OR</button>
        <button class="btn btn-primary flex-1" @click="addCircuit('NOT')">NOT</button>
        <button class="btn btn-primary flex-1" @click="addCircuit('INPUT')">Input</button>
        <button class="btn btn-primary flex-1" @click="addCircuit('OUTPUT')">Output</button>
      </div>
    </div>
  </dialog>

  <div class="h-screen flex flex-col justify-center items-center" v-if="componentStore.isLoading()">
    <LoadingIndicator></LoadingIndicator>
  </div>

  <div class="flex flex-row justify-center items-center mt-5 mb-5" v-if="errorOccurred && !componentStore.isLoading()">
    <div class="w-1/2">
      <div role="alert" class="alert alert-error">
        <ExclamationCircleIcon class="size-6"></ExclamationCircleIcon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>

  <div v-if="!componentStore.isLoading() && !errorOccurred">
    <Viewport ref="viewportRef"></Viewport>
    <div id="generic-overlay">
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
    <div class="generic-overlay">
      <div class="flex justify-end text-white mr-10 my-10 text-lg">
        <div v-if="componentStore.isAstAnalysable" class="text-success">
          <CheckCircleIcon class="size-10 mr-5 inline"></CheckCircleIcon>
          <span>Analysable</span>
        </div>
        <div v-if="!componentStore.isAstAnalysable" class="text-error">
          <ExclamationTriangleIcon class="size-10 mr-5 inline"></ExclamationTriangleIcon>
          <span>Floating Connections Present</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generic-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
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