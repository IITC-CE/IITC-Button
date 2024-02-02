<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="page">
    <div class="parent">
      <BlockURL></BlockURL>
      <h3 class="or">
        — <span id="or">{{ _("or") }}</span> —
      </h3>
      <BlockDrop></BlockDrop>
    </div>
  </div>
</template>

<script>
import BlockURL from "./BlockURL";
import BlockDrop from "./BlockDrop";
import { _ } from "@/i18n";

export default {
  name: "PageAddPlugin",
  methods: {
    _: _,
  },
  components: { BlockURL, BlockDrop },
};
</script>

<style src="../../../public/assets/roboto/roboto-font.css"></style>

<style scoped>
.or {
  text-align: center;
  color: #fff;
}
</style>
