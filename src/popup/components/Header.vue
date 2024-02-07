<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
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

<script>
import { mixin } from "./mixins.js";

export default {
  name: "Header",
  props: {
    header_text: String,
    button_text: String,
  },
  methods: {
    button_onclick() {
      this.$emit("button_onclick");
    },
  },
  mixins: [mixin],
};
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
