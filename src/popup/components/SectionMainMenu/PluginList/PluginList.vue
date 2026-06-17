<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="list">
    <template v-if="plugins">
      <template v-if="active_tag === 'All'">
        <Title :text="t('pluginListEnabledPlugins')"></Title>
        <Plugin
          :plugin="iitc_core"
          v-if="iitc_core && search_query === ''"
        ></Plugin>
        <Plugin
          v-for="(plugin, uid) in enabledPlugins"
          :key="'enabled-' + uid"
          :plugin="plugin"
          @update-plugin="handlePluginUpdate"
          @delete-plugin="handlePluginDelete"
        ></Plugin>
        <NoData
          v-if="objIsEmpty(enabledPlugins) && search_query !== ''"
        ></NoData>

        <Title :text="t('pluginListAllPlugins')"></Title>
        <Plugin
          v-for="(plugin, uid) in allPlugins"
          :key="'all-' + uid"
          :plugin="plugin"
          @update-plugin="handlePluginUpdate"
          @delete-plugin="handlePluginDelete"
        ></Plugin>
        <NoData v-if="objIsEmpty(allPlugins)"></NoData>
      </template>
      <template v-else>
        <Plugin
          v-for="(plugin, uid) in allPlugins"
          :key="uid"
          :plugin="plugin"
          @update-plugin="handlePluginUpdate"
          @delete-plugin="handlePluginDelete"
        ></Plugin>
        <NoData v-if="objIsEmpty(allPlugins)"></NoData>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { type PropType } from "vue";
import Title from "./Title.vue";
import Plugin from "./Plugin.vue";
import { mixin } from "@/popup/components/mixins";
import NoData from "@/popup/components/SectionMainMenu/PluginList/NoData.vue";
import type { Plugin as PluginType, PluginDict } from "lib-iitc-manager";

export default defineComponent({
  name: "ListPlugins",
  props: {
    plugins: {
      type: Object as PropType<PluginDict>,
      required: true as const,
    },
    iitc_core: Object as PropType<PluginType>,
    search_query: String,
    active_tag: String,
  },
  emits: ["update-plugin", "delete-plugin"],
  data() {
    return {};
  },
  mixins: [mixin],
  methods: {
    handlePluginUpdate(updatedPlugin: PluginType) {
      this.$emit("update-plugin", updatedPlugin);
    },
    handlePluginDelete(pluginUID: string) {
      this.$emit("delete-plugin", pluginUID);
    },
  },
  computed: {
    enabledPlugins() {
      const obj = Object.fromEntries(
        Object.entries(this.plugins).filter(
          ([, plugin]) => plugin.status === "on",
        ),
      );
      return this.sortIITCObj(obj);
    },
    allPlugins() {
      return this.sortIITCObj(this.plugins);
    },
  },
  components: { NoData, Title, Plugin },
});
</script>

<style scoped>
.list {
  overflow-y: scroll;
}
</style>
