<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="element item-wrapper list__item">
    <span class="element__text">{{ _("noData") }}</span>
  </div>
</template>

<script>
import { mixin } from "@/popup/components/mixins.js";

export default {
  name: "NoData",
  mixins: [mixin],
};
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
