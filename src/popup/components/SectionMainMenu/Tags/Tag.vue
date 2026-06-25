<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div
    class="tag"
    :class="{ active: isActive, 'has-new-plugins': isNew }"
    :style="{ '--tag-hue': getTagHue(tag.name) }"
    @click="handleClick"
  >
    {{ tag.name }}
  </div>
</template>

<script lang="ts">
import { type PropType } from "vue";
import { emitter } from "@/popup/eventBus";

export default defineComponent({
  name: "Tag",
  props: {
    tag: {
      type: Object as PropType<{ name: string; isNew?: boolean }>,
      required: true as const,
    },
    isActive: Boolean,
    isNew: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      emitter.emit("tag:active", this.tag.name);
    },
    // Only the hue is per-category; theme-aware vars supply lightness/chroma
    getTagHue(tag: string) {
      return `${this.hashString(tag) % 360}deg`;
    },
    hashString(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    },
  },
});
</script>

<style scoped>
.tag {
  /* Per-category hue tint over a theme base: near-white in light, dark in dark */
  --tag-hue: 0deg;
  --tag-l: 96.5%;
  --tag-c: 0.012;
  --tag-border-l: 88%;
  --tag-border-c: 0.02;
  --tag-active-l: 92%;
  --tag-active-c: 0.11;
  --tag-active-border-l: 76%;
  --tag-active-border-c: 0.14;

  position: relative;
  display: flex;
  cursor: pointer;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  color: var(--on-surface);
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 6px;
  border: 1px solid
    oklch(var(--tag-border-l) var(--tag-border-c) var(--tag-hue));
  background-color: oklch(var(--tag-l) var(--tag-c) var(--tag-hue));
  box-shadow: none;
  transition:
    border 0.1s ease,
    background-color 0.1s ease,
    box-shadow 0.1s ease;
}

.tag.active,
.tag:hover {
  border-color: oklch(
    var(--tag-active-border-l) var(--tag-active-border-c) var(--tag-hue)
  );
  background-color: oklch(
    var(--tag-active-l) var(--tag-active-c) var(--tag-hue)
  );
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

@media (prefers-color-scheme: dark) {
  .tag {
    --tag-l: 31%;
    --tag-c: 0.035;
    --tag-border-l: 35%;
    --tag-border-c: 0.05;
    --tag-active-l: 40%;
    --tag-active-c: 0.08;
    --tag-active-border-l: 55%;
    --tag-active-border-c: 0.1;
  }
}

.tag.has-new-plugins::after {
  content: "";
  position: absolute;
  top: -3px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--state-warning);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
