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
    _: _
  },
  components: { BlockURL, BlockDrop }
};
</script>

<style src="../../../public/assets/roboto/roboto-font.css"></style>

<style>
.page {
  width: 100%;
  height: 100%;
  margin: 0;
  background: #e8e9ec;
  color: #222;
  font-size: 18px;
  overflow: hidden;
}

.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #2B2B2B;
  height: 100vh;
  width: 100%;
}

.or {
  color: #fff;
}
</style>
