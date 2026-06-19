<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="element">
    <div class="title" v-bind:title="description" v-on:click="item_onclick">
      <span class="title__text">{{ text }}</span>
    </div>
    <div class="border"></div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "Title",
  props: {
    text: String,
    description: String,
  },
  emits: ["item_onclick"],
  methods: {
    item_onclick() {
      this.$emit("item_onclick");
    },
  },
});
</script>

<style scoped>
.border {
  border-bottom: 1px solid var(--color-silver);
  width: calc(100% - 40px);
  margin-left: 40px;
}

.title {
  display: flex;
  padding: 6px 4px 4px 40px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title__text {
  flex: auto;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-black);
}
</style>
