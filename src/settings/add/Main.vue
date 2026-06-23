<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="page-crumbs">{{ t("sidebarPlugins") }}</div>
          <h1 class="page-title">{{ t("addExternalPlugin") }}</h1>
        </div>
      </div>
    </header>
    <div class="page-scroll">
      <div class="page-inner">
        <section>
          <div class="block-head">
            <div class="block-title">{{ t("installFromUrlTitle") }}</div>
            <div class="block-sub">{{ t("installFromUrlHint") }}</div>
          </div>
          <BlockURL></BlockURL>
        </section>

        <div class="add-divider">
          <span class="add-divider__line"></span>
          <span class="add-divider__text">{{ t("or") }}</span>
          <span class="add-divider__line"></span>
        </div>

        <section>
          <BlockDrop></BlockDrop>
        </section>
      </div>
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
.add-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--on-surface-variant);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 0;
}

.add-divider__line {
  flex: 1;
  height: 1px;
  background: var(--outline);
}
</style>
