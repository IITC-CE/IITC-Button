<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="nodata">{{ t("noData") }}</div>
</template>

<script lang="ts">
import { mixin } from "@/popup/components/mixins";

export default defineComponent({
  name: "NoData",
  mixins: [mixin],
});
</script>

<style scoped>
.nodata {
  padding: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--on-surface-variant);
}
</style>
