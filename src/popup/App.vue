<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div id="app">
    <section class="section main-menu">
      <SectionMainMenu
        v-bind:categories="categories"
        v-bind:plugins_flat="plugins_flat"
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
  </div>
</template>

<script>
import SectionMainMenu from "./components/SectionMainMenu.vue";
import SectionOptions from "./components/SectionOptions.vue";
import SectionPlugins from "./components/SectionPlugins.vue";

import Message from "./components/Message";

import * as data from "./data.js";

export default {
  name: "App",
  data() {
    return {
      categories: {},
      plugins: {},
      plugins_flat: {},
      category_name: ""
    };
  },
  components: { SectionMainMenu, SectionOptions, SectionPlugins, Message },
  async mounted() {
    document.body.id = "main-menu";
    await data.init(this);
    await data.onChangedListener(this);
    await data.onMessageListener(this);
  }
};
</script>

<style src="../../public/assets/iconfont/material-icons.css"></style>
<style src="../../public/assets/roboto/roboto-font.css"></style>

<style>
body {
  cursor: default;
  min-width: 325px;
  min-height: 513px;
  overflow: hidden;
  margin: 0;
  color: #222;
  font-size: 12px;
}

.material-icons {
  font-size: 20px;
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
  position: absolute;
  top: 0;
  margin-left: 100vw;
  transition: margin-left 0.15s ease-in-out;
  width: 100vw;
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
