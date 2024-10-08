<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="list">
    <Title></Title>
    <SearchBar v-model="search_query"></SearchBar>
    <Tags :categories="categories" :all_plugins="plugins_flat"></Tags>
    <PluginList
      :plugins="pluginsToDisplay"
      :iitc_core="iitc_core"
      :search_query="search_query"
      @update-plugin="updatePlugin"
      @delete-plugin="deletePlugin"
    ></PluginList>
  </div>
</template>

<script>
import Title from "./Title.vue";
import SearchBar from "./SearchBar.vue";
import { mixin } from "../mixins.js";
import { searchPlugins } from "@/popup/search";
import PluginList from "./PluginList/PluginList.vue";
import Tags from "./Tags/Tags.vue";
import browser from "webextension-polyfill";

export default {
  name: "SectionMainMenu",
  props: {
    categories: Object,
    plugins_flat: Object,
    iitc_core: Object,
  },
  data() {
    return {
      search_query: "",
      search_results: {},
      activeTag: "All",
    };
  },
  mixins: [mixin],
  computed: {
    pluginsToDisplay() {
      let plugins = { ...this.plugins_flat };
      if (this.search_query) {
        plugins = this.search_results;
      }
      return this.filteredPlugins(plugins);
    },
  },
  watch: {
    search_query: function (val) {
      this.search_results = searchPlugins(val, this.plugins_flat);
    },
  },
  methods: {
    filteredPlugins(plugins) {
      if (this.activeTag === "All") {
        return plugins;
      }
      if (typeof plugins !== "object" || plugins === null) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(plugins).filter(
          ([, plugin]) => plugin.category === this.activeTag
        )
      );
    },
    async updatePlugin(updatedPlugin) {
      this.$set(this.plugins_flat, updatedPlugin.uid, updatedPlugin);

      if (this.search_query) {
        this.search_results = searchPlugins(
          this.search_query,
          this.plugins_flat
        );
      }

      this.showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({
        type: "managePlugin",
        uid: updatedPlugin.uid,
        action: updatedPlugin.status,
      });
    },
    deletePlugin(pluginUID) {
      this.$delete(this.plugins_flat, pluginUID);

      if (this.search_query) {
        this.search_results = searchPlugins(
          this.search_query,
          this.plugins_flat
        );
      }
    },
  },
  mounted() {
    this.$root.$on("tag:active", (activeTag) => {
      this.activeTag = activeTag;
    });
  },
  components: { Tags, PluginList, Title, SearchBar },
};
</script>

<style scoped>
.list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
