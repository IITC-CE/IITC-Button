<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="title">
    <div
      class="title__logo-wrapper title__button"
      v-on:click.prevent="openIITC"
    >
      <img
        class="title__logo"
        src="/assets/images/IITC-black-horizontally.webp"
      />
      <ProgressBar></ProgressBar>
    </div>
    <div
      class="title__button"
      :title="_('addExternalPlugin')"
      v-on:click="openLink('/settings.html#add')"
    >
      <i class="title__icon material-icons">add</i>
    </div>
    <div class="title__button" v-on:click="openOptions">
      <i class="title__icon material-icons">settings</i>
    </div>
    <ToggleIITC></ToggleIITC>
  </div>
</template>

<script>
import { mixin } from "./mixins.js";
import ProgressBar from "./ProgressBar";
import ToggleIITC from "./ToggleIITC";

export default {
  name: "Title",
  mixins: [mixin],
  methods: {
    openIITC: async function() {
      await browser.runtime.sendMessage({ type: "requestOpenIntel" });
      window.close();
    },
    openOptions: function() {
      document.body.id = "options";
    }
  },
  components: { ProgressBar, ToggleIITC }
};
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  height: 50px;
  background: #222;
  padding-top: 0;
  padding-bottom: 0;
  cursor: pointer;
}
.title__logo-wrapper {
  flex: auto;
}
.title__logo {
  height: 50px;
  width: 106px;
  z-index: 3;
  position: relative;
  left: calc(50% - 106px / 2);
}
.title__button {
  color: var(--color-white);
  border-left: 1px solid #333;
}
.title__button:hover {
  background: #333;
}
.title__icon {
  font-size: 24px;
  padding: 12px;
}
</style>
