<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="element">
    <div class="title" v-bind:title="description" v-on:click="item_onclick">
      <span class="title__text">{{ text }}</span>
    </div>
    <div class="border"></div>
  </div>
</template>

<script>
export default {
  name: "Title",
  props: {
    text: String,
    description: String,
  },
  methods: {
    item_onclick() {
      this.$emit("item_onclick");
    },
  },
};
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
