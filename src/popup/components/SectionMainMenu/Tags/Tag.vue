<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div
    class="tag"
    :class="{ active: isActive }"
    :style="{ '--tag-color': getTagColor(tag.name) }"
    @click="handleClick"
  >
    {{ tag.name }}
  </div>
</template>

<script>
export default {
  name: "Tag",
  props: {
    tag: Object,
    isActive: Boolean,
  },
  methods: {
    handleClick() {
      this.$root.$emit("tag:active", this.tag.name);
    },
    getTagColor(tag) {
      const hash = this.hashString(tag);
      const hue = hash % 360;
      const lightness = 1;
      const chroma = 0.03;

      return `oklch(${lightness} ${chroma} ${hue}deg)`;
    },
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    },
  },
};
</script>

<style scoped>
.tag {
  --tag-color: #eee;
  display: flex;
  cursor: pointer;
  padding: 4px 10px;
  margin: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;
  border: 1px solid oklch(from var(--tag-color) calc(l - 0.1) calc(c - 0.01) h);
  background-color: var(--tag-color);
  box-shadow: none;
  transition: border 0.1s ease, background-color 0.1s ease, box-shadow 0.1s ease;
}
.tag.active,
.tag:hover {
  border-color: oklch(from var(--tag-color) calc(l - 0.2) calc(c + 0.05) h);
  background-color: oklch(from var(--tag-color) l calc(c + 0.2) h);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
</style>
