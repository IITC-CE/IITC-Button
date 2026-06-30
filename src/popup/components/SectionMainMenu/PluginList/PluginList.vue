<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <OverlayScrollbarsComponent
    ref="osRef"
    class="plugin-list"
    :options="osOptions"
  >
    <template v-if="plugins">
      <template v-if="active_tag === 'All'">
        <template v-if="showEnabledSection">
          <Title :text="t('pluginListEnabledPlugins')"></Title>
          <div class="list-card">
            <Plugin
              :plugin="iitc_core"
              v-if="iitc_core && search_query === ''"
            ></Plugin>
            <Plugin
              v-for="(plugin, uid) in enabledPlugins"
              :key="'enabled-' + uid"
              :plugin="plugin"
              @update-plugin="handlePluginUpdate"
            ></Plugin>
          </div>
        </template>

        <Title :text="t('pluginListAllPlugins')"></Title>
        <div class="list-card">
          <Plugin
            v-for="(plugin, uid) in allPlugins"
            :key="'all-' + uid"
            :plugin="plugin"
            @update-plugin="handlePluginUpdate"
          ></Plugin>
          <NoData v-if="objIsEmpty(allPlugins)"></NoData>
        </div>
      </template>
      <template v-else>
        <div class="list-card">
          <Plugin
            v-for="(plugin, uid) in allPlugins"
            :key="uid"
            :plugin="plugin"
            @update-plugin="handlePluginUpdate"
          ></Plugin>
          <NoData v-if="objIsEmpty(allPlugins)"></NoData>
        </div>
      </template>
    </template>
  </OverlayScrollbarsComponent>
</template>

<script lang="ts">
import { type PropType } from "vue";
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-vue";
import type { PartialOptions } from "overlayscrollbars";
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
  emits: ["update-plugin"],
  data(): { osOptions: PartialOptions } {
    return {
      osOptions: {
        scrollbars: {
          theme: "iitc-scrollbar",
          autoHide: "never",
          dragScroll: true,
        },
      },
    };
  },
  mixins: [mixin],
  watch: {
    // OverlayScrollbars recalculates via debounced observers, which visibly
    // lags when the whole list is swapped (e.g. category switch). 'post' flush
    // runs after Vue has applied the DOM update, so we force a recalc against
    // the already-rendered list.
    plugins: { handler: "refreshScrollbar", flush: "post" },
    active_tag: { handler: "refreshScrollbar", flush: "post" },
  },
  methods: {
    handlePluginUpdate(updatedPlugin: PluginType) {
      this.$emit("update-plugin", updatedPlugin);
    },
    refreshScrollbar() {
      const ref = this.$refs.osRef as OverlayScrollbarsComponentRef | undefined;
      ref?.osInstance()?.update(true);
    },
  },
  computed: {
    // Hidden when there's nothing to show
    showEnabledSection(): boolean {
      const hasCore = Boolean(this.iitc_core) && this.search_query === "";
      return hasCore || !this.objIsEmpty(this.enabledPlugins);
    },
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
  components: { NoData, Title, Plugin, OverlayScrollbarsComponent },
});
</script>

<style scoped>
.plugin-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 12px 12px;
}
.plugin-list :deep(.section-label:first-child) {
  padding-top: 0;
}
.list-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.list-card :deep(.row:first-child) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.list-card :deep(.row:last-child) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
