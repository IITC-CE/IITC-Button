<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <header class="header">
    <i class="header__icon material-icons" v-on:click="back"
      >keyboard_arrow_left</i
    >
    <span class="header__text">{{ header_text }}</span>
    <div class="button" v-if="button_text" v-on:click="button_onclick">
      {{ button_text }}
    </div>
  </header>
</template>

<script lang="ts">
import { mixin } from "./mixins";

export default defineComponent({
  name: "Header",
  props: {
    header_text: String,
    button_text: String,
  },
  emits: ["button_onclick"],
  methods: {
    button_onclick() {
      this.$emit("button_onclick");
    },
  },
  mixins: [mixin],
});
</script>

<style scoped>
.header {
  display: flex;
  padding: 4px;
  border-bottom: 1px solid #eee;
  cursor: default;
}
.header__icon {
  margin-right: 8px;
  padding: 6px;
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;
}
.header__icon:hover {
  background-color: var(--color-silver);
}
.header__text {
  flex: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 32px;
}
</style>
