<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="menu">
    <Title></Title>
    <div class="toolbar">
      <ChannelStrip></ChannelStrip>
      <SearchBar v-model="search_query"></SearchBar>
    </div>
    <Tags :categories="categories" :all_plugins="plugins_flat"></Tags>
    <PluginList
      :plugins="pluginsToDisplay"
      :iitc_core="iitc_core"
      :search_query="search_query"
      :active_tag="activeTag"
      @update-plugin="updatePlugin"
      @delete-plugin="deletePlugin"
    ></PluginList>
  </div>
</template>

<script lang="ts">
import Title from "./Title.vue";
import ChannelStrip from "./ChannelStrip.vue";
import SearchBar from "./SearchBar.vue";
import { type PropType } from "vue";
import { mixin } from "../mixins";
import { searchPlugins } from "@/popup/search";
import PluginList from "./PluginList/PluginList.vue";
import Tags from "./Tags/Tags.vue";
import browser from "webextension-polyfill";
import { emitter } from "@/popup/eventBus";
import type { Plugin, PluginDict } from "lib-iitc-manager";

export default defineComponent({
  name: "SectionMainMenu",
  props: {
    categories: Object,
    plugins_flat: {
      type: Object as PropType<PluginDict>,
      required: true as const,
    },
    iitc_core: Object as PropType<Plugin>,
  },
  emits: ["update-plugin", "delete-plugin"],
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
    filteredPlugins(plugins: PluginDict) {
      if (this.activeTag === "All") {
        return plugins;
      }
      if (typeof plugins !== "object" || plugins === null) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(plugins).filter(
          ([, plugin]) => (plugin as Plugin).category === this.activeTag,
        ),
      );
    },
    async updatePlugin(updatedPlugin: Plugin) {
      this.$emit("update-plugin", updatedPlugin);

      if (this.search_query) {
        this.search_results = searchPlugins(
          this.search_query,
          this.plugins_flat,
        );
      }

      await browser.runtime.sendMessage({
        type: "managePlugin",
        uid: updatedPlugin.uid,
        action: updatedPlugin.status,
      });
    },
    deletePlugin(pluginUID: string) {
      this.$emit("delete-plugin", pluginUID);

      if (this.search_query) {
        this.search_results = searchPlugins(
          this.search_query,
          this.plugins_flat,
        );
      }
    },
  },
  mounted() {
    emitter.on("tag:active", (activeTag) => {
      this.activeTag = activeTag;
    });
  },
  components: { Tags, PluginList, Title, ChannelStrip, SearchBar },
});
</script>

<style scoped>
.menu {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 12px 4px;
}
</style>
