<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="window">
    <Header v-bind:header_text="__('name', categories[category_name])"></Header>
    <div class="plugins-list">
      <ElementPlugin
        v-for="(plugin, index) in sortIITCObj(plugins)"
        v-bind:key="index"
        v-bind:category_name="category_name"
        v-bind:plugin="plugin"
      ></ElementPlugin>
      <Element v-if="objIsEmpty(plugins)" v-bind:text="_('noData')"></Element>
    </div>
  </div>
</template>

<script>
import Header from "./Header";
import Element from "./Element";
import ElementPlugin from "./ElementPlugin";

import { mixin } from "./mixins.js";

export default {
  name: "SectionPlugins",
  props: {
    category_name: String,
    categories: Object,
    plugins: Object,
  },
  mixins: [mixin],
  components: { Header, Element, ElementPlugin },
};
</script>

<style scoped>
.window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plugins-list {
  overflow-y: auto;
}
.plugins-list .item-wrapper:last-child {
  margin-bottom: 5px;
}
</style>
