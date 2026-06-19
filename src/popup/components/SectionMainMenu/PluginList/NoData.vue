<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="element item-wrapper list__item">
    <span class="element__text">{{ t("noData") }}</span>
  </div>
</template>

<script lang="ts">
import { mixin } from "@/popup/components/mixins";

export default defineComponent({
  name: "NoData",
  mixins: [mixin],
});
</script>

<style scoped>
.element {
  display: flex;
  cursor: pointer;
  padding: 4px 4px 4px 40px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--color-white);
}

.element__text {
  flex: auto;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
