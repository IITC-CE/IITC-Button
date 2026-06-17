<!-- Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->

<template>
  <div
    id="progressbar"
    class="progressbar"
    v-bind:class="{ active: showProgressbar }"
  ></div>
</template>

<script lang="ts">
import { emitter } from "@/popup/eventBus";

export default defineComponent({
  name: "ProgressBar",
  data() {
    return {
      showProgressbar: false,
    };
  },
  mounted() {
    emitter.on("showProgressbar", (status) => {
      this.$data.showProgressbar = status;
    });
  },
});
</script>

<style scoped>
.progressbar {
  opacity: 0;
  transition: opacity 0.2s linear;
  animation-play-state: paused;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 50px;
  width: calc(100% - 147px);
  background-color: #222;
  animation: preloader-background ease-in-out 2s infinite;
}
.progressbar.active {
  opacity: 1;
  animation-play-state: running;
}
.progressbar::before,
.progressbar::after {
  animation-play-state: running;
  display: block;
  position: absolute;
  top: 0;
  z-index: 2;
  width: 0;
  height: 50px;
  animation: preloader-front ease-in-out 2s infinite;
  content: "";
}
.progressbar.active::before,
.progressbar.active::after {
  animation-play-state: running;
}
.progressbar::before {
  right: 100%;
}
.progressbar::after {
  left: 0;
}

@keyframes preloader-background {
  0%,
  44.9999% {
    background-color: #222;
  }
  50%,
  100% {
    background-color: #444;
  }
}
@keyframes preloader-front {
  0% {
    width: 0;
    background-color: #444;
  }
  49.9999% {
    width: 100%;
    background-color: #444;
  }
  50% {
    width: 0;
    background-color: #222;
  }
  100% {
    width: 100%;
    background-color: #222;
  }
}
</style>
