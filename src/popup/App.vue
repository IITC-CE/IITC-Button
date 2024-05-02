<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div id="app" :class="{ is_safari: is_safari }">
    <section class="section main-menu">
      <SectionMainMenu
        v-bind:categories="categories"
        v-bind:plugins_flat="plugins_flat"
        v-bind:iitc_core="iitc_core"
      >
      </SectionMainMenu>
    </section>
    <section class="section options">
      <SectionOptions> </SectionOptions>
    </section>
    <section class="section plugins">
      <SectionPlugins
        v-bind:category_name="category_name"
        v-bind:plugins="plugins"
        v-bind:categories="categories"
      >
      </SectionPlugins>
    </section>
    <Message></Message>
    <Alert></Alert>
  </div>
</template>

<script>
import SectionMainMenu from "./components/SectionMainMenu.vue";
import SectionOptions from "./components/SectionOptions.vue";
import SectionPlugins from "./components/SectionPlugins.vue";

import Message from "./components/Message";
import Alert from "./components/Alert";

import * as data from "./data.js";
import browser from "webextension-polyfill";

export default {
  name: "App",
  data() {
    return {
      categories: {},
      plugins: {},
      plugins_flat: {},
      category_name: "",
      iitc_core: {},
      is_safari: this.detect_safari(),
    };
  },
  components: {
    SectionMainMenu,
    SectionOptions,
    SectionPlugins,
    Message,
    Alert,
  },
  beforeCreate() {
    document.body.id = "main-menu";
  },
  async mounted() {
    await data.init(this);
    await data.onChangedListener(this);
    await data.onMessageListener(this);
    await browser.runtime.sendMessage({ type: "popupWasOpened" });
  },
  methods: {
    detect_safari: function () {
      let userAgentString = navigator.userAgent;
      let chromeAgent = userAgentString.indexOf("Chrome") > -1;
      let safariAgent = userAgentString.indexOf("Safari") > -1;

      return safariAgent && !chromeAgent;
    },
  },
};
</script>

<style src="../../public/assets/iconfont/material-icons.css"></style>
<style src="../../public/assets/roboto/roboto-font.css"></style>

<style>
body {
  cursor: default;
  min-width: 350px;
  min-height: 520px;
  overflow: hidden;
  margin: 0;
  color: #222;
  font-size: 12px;
}

.material-icons {
  font-size: 20px;
}

#app {
  width: 350px;
  height: 520px;
  overflow: hidden;
  /*transform: translateZ(0); * hack of popup size in safari *!*/
}

object {
  pointer-events: none;
}

/*
 * item-wrapper
 */
.item-wrapper {
  border-bottom: 1px solid var(--color-white);
}
.item-wrapper:last-child {
  border-bottom: 0;
}
.categories .item-wrapper:last-child {
  border-bottom: 1px solid var(--color-white);
}

/*
 * section
 */
.section {
  display: block;
  background: #fff;
  position: absolute;
  top: 0;
  margin-left: 100vw;
  transition: margin-left 0.15s ease-in-out;
  width: 100vw;
  height: 100vh;
}
.section.main-menu {
  margin-left: -100vw;
}
body#main-menu .section.main-menu {
  margin-left: 0;
  z-index: 1;
}
body#options .section.options,
body#plugins .section.plugins {
  margin-left: 0;
}

#app.is_safari .section {
  display: none;
  width: 100vw;
}

#app.is_safari .section.main-menu {
  display: none;
}

body#main-menu #app.is_safari .section.main-menu {
  display: block;
}

body#options #app.is_safari .section.options,
body#plugins #app.is_safari .section.plugins {
  display: block;
}

/*
 * button
 */
.button {
  cursor: pointer;
  line-height: 28px;
  padding: 0 10px;
  background: #eee;
  border-radius: 2px;
  border: 1px solid #ccc;
  transition: background 0.1s linear;
}
.button:hover,
.button:active,
.button:focus {
  background: #f2f2f2;
}

:root {
  --color-white: #fff;
  --color-blue: #0074d9;
  --color-olive: #48a77c;
  --color-green: #2ecc40;
  --color-lime: #01ff70;
  --color-yellow: #ffdc00;
  --color-orange: #ff851b;
  --color-red: #ff4136;
  --color-black: #111;
  --color-gray: #aaa;
  --color-silver: #eee;
  --state-on: #43a047;
  --state-off: #e53935;
  --state-off2: #6c3939;
}
</style>
