<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="section-label">{{ text }}</div>
</template>

<script lang="ts">
export default defineComponent({
  name: "Title",
  props: {
    text: String,
  },
});
</script>

<style scoped>
.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--on-surface-variant);
  padding: 12px 4px 8px;
}
</style>
