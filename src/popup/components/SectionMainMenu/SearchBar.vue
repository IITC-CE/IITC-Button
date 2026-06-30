<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="search">
    <div class="search__box">
      <i class="material-icons search__icon">search</i>
      <input
        class="search__input"
        type="text"
        v-bind:placeholder="t('searchBoxPlaceholder')"
        :value="modelValue"
        @input="onInput"
        autofocus
      />
      <i
        class="material-icons search__cancel"
        :class="{ show: modelValue }"
        v-on:click="cancel"
        >cancel</i
      >
    </div>
  </div>
</template>

<script lang="ts">
import { mixin } from "../mixins";

export default defineComponent({
  name: "SearchBar",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    cancel() {
      this.$emit("update:modelValue", "");
    },
    onInput(e: Event) {
      this.$emit("update:modelValue", (e.target as HTMLInputElement).value);
    },
  },
  mixins: [mixin],
});
</script>

<style scoped>
.search {
  flex: 1;
  min-width: 0;
}
.search__box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  background: var(--surface-container);
  border: 1px solid var(--outline);
  border-radius: 10px;
}
.search__icon {
  font-size: 18px;
  color: var(--on-surface-variant);
}
.search__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: var(--on-surface);
}
.search__cancel {
  font-size: 16px;
  color: var(--on-surface-variant);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.search__cancel.show {
  opacity: 0.6;
}
.search__cancel.show:hover {
  opacity: 1;
}
</style>
