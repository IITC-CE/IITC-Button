<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="list">
    <template v-if="plugins">
      <Title :text="_('pluginListEnabledPlugins')"></Title>
      <Plugin :plugin="iitc_core" v-if="search_query === ''"></Plugin>
      <Plugin
        v-for="(plugin, index) in enabledPlugins"
        :key="index"
        :plugin="plugin"
        @update-plugin="handlePluginUpdate"
        @delete-plugin="handlePluginDelete"
      ></Plugin>
      <NoData v-if="objIsEmpty(enabledPlugins) && search_query !== ''"></NoData>
    </template>
    <template v-if="plugins">
      <Title v-bind:text="_('pluginListDisabledPlugins')"></Title>
      <Plugin
        v-for="(plugin, index) in disabledPlugins"
        :key="index"
        :plugin="plugin"
        @update-plugin="handlePluginUpdate"
        @delete-plugin="handlePluginDelete"
      ></Plugin>
      <NoData v-if="objIsEmpty(disabledPlugins)"></NoData>
    </template>
  </div>
</template>

<script>
import Title from "./Title.vue";
import Plugin from "./Plugin.vue";
import { mixin } from "@/popup/components/mixins.js";
import NoData from "@/popup/components/SectionMainMenu/PluginList/NoData.vue";

export default {
  name: "ListPlugins",
  props: {
    plugins: Object,
    iitc_core: Object,
    search_query: String,
  },
  data() {
    return {};
  },
  mixins: [mixin],
  methods: {
    handlePluginUpdate(updatedPlugin) {
      this.$emit("update-plugin", updatedPlugin);
    },
    handlePluginDelete(pluginUID) {
      this.$emit("delete-plugin", pluginUID);
    },
  },
  computed: {
    enabledPlugins() {
      const obj = Object.fromEntries(
        Object.entries(this.plugins).filter(
          ([, plugin]) => plugin.status === "on"
        )
      );
      return this.sortIITCObj(obj);
    },
    disabledPlugins() {
      const obj = Object.fromEntries(
        Object.entries(this.plugins).filter(
          ([, plugin]) => plugin.status !== "on"
        )
      );
      return this.sortIITCObj(obj);
    },
  },
  components: { NoData, Title, Plugin },
};
</script>

<style scoped>
.list {
  overflow-y: scroll;
}
</style>
