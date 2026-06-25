<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="progressbar" :class="{ active: active }"></div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";

export default defineComponent({
  name: "ProgressBar",
  data() {
    return {
      active: false,
    };
  },
  methods: {
    onMessage(request: unknown) {
      const msg = request as { type: string; value?: boolean };
      if (msg.type === "showProgressbar") {
        this.active = Boolean(msg.value);
      }
    },
  },
  mounted() {
    browser.runtime.onMessage.addListener(this.onMessage);
  },
  beforeUnmount() {
    browser.runtime.onMessage.removeListener(this.onMessage);
  },
});
</script>

<style scoped>
.progressbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s linear;
  pointer-events: none;
  z-index: 10;
  background: var(--accent);
}
.progressbar.active {
  opacity: 1;
}
.progressbar::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  background: oklch(from var(--accent) calc(l + 0.15) c h);
  animation: progressbar-sweep 1.4s linear infinite;
}

@keyframes progressbar-sweep {
  0% {
    left: -40%;
    width: 40%;
  }
  50% {
    left: 30%;
    width: 60%;
  }
  100% {
    left: 100%;
    width: 40%;
  }
}
</style>
