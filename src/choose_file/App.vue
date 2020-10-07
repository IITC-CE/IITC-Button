<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div>
    <div class="bg"></div>
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
import { _ } from "../helpers";

export default {
  name: "App",
  methods: {
    _: _
  },
  components: { BlockURL, BlockDrop }
};
</script>

<style src="../../public/assets/roboto/roboto-font.css"></style>

<style>
body {
  width: 100%;
  height: 100%;
  margin: 0;
  background: #e8e9ec;
  color: #222;
  font-size: 18px;
  overflow: hidden;
}

.bg {
  background: #0e3d4e url("/assets/images/background.webp");
  background-size: cover;
  transform: scale(1.1);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: blur(8px);
}

.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
}

.or {
  color: #fff;
}
</style>
