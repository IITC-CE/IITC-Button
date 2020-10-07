<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="title">
    <div
      class="title__logo-wrapper title__button"
      v-on:click.prevent="openIITC"
    >
      <object
        class="title__logo"
        type="image/svg+xml"
        data="/assets/images/IITC-black-horizontally.svg"
      ></object>
      <ProgressBar></ProgressBar>
    </div>
    <div class="title__button" v-on:click="openOptions">
      <i class="title__settings material-icons">settings</i>
    </div>
    <ToggleIITC></ToggleIITC>
  </div>
</template>

<script>
import ProgressBar from "./ProgressBar";
import ToggleIITC from "./ToggleIITC";

export default {
  name: "Title",
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
  width: 100%;
  z-index: 3;
  position: relative;
}
.title__button {
  color: var(--color-white);
  border-left: 1px solid #333;
}
.title__button:hover {
  background: #333;
}
.title__settings {
  font-size: 24px;
  padding: 12px;
}
</style>
