<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <div class="parent">
      <BlockURL></BlockURL>
      <h3 class="or">
        — <span id="or">{{ t("or") }}</span> —
      </h3>
      <BlockDrop></BlockDrop>
    </div>
  </div>
</template>

<script lang="ts">
import BlockURL from "./BlockURL.vue";
import BlockDrop from "./BlockDrop.vue";
import { t } from "@/i18n";

export default defineComponent({
  name: "PageAddPlugin",
  methods: {
    t: t,
  },
  components: { BlockURL, BlockDrop },
});
</script>

<style scoped>
.or {
  text-align: center;
  color: #fff;
}
</style>
