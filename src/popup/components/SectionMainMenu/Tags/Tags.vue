<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div class="element">
    <Tag
      v-for="(tag, key) in tags"
      :key="key"
      :tag="tag"
      :isActive="tag.name === activeTag"
      :isNew="tag.isNew"
    ></Tag>
  </div>
</template>

<script lang="ts">
import Tag from "./Tag.vue";
import { emitter } from "@/popup/eventBus";
import type { Plugin } from "lib-iitc-manager";

export default defineComponent({
  name: "Tags",
  props: {
    categories: Object,
    all_plugins: Object,
  },
  data() {
    return {
      activeTag: "All",
    };
  },
  mounted() {
    emitter.on("tag:active", (activeTag) => {
      this.activeTag = activeTag;
    });
  },
  methods: {
    isRecentlyAdded(plugin: Plugin, currentTime: number) {
      const oneHourInSeconds = 60 * 60;
      return plugin.addedAt && currentTime - plugin.addedAt <= oneHourInSeconds;
    },
  },
  computed: {
    tags() {
      if (!this.all_plugins || !this.categories) return {};

      const currentTime = Date.now() / 1000;
      const categoriesWithPlugins = new Set();
      const categoriesWithNewPlugins = new Set();

      Object.values(this.all_plugins ?? {}).forEach((plugin) => {
        const category = plugin.category;
        if (!category) return;

        categoriesWithPlugins.add(category);
        if (this.isRecentlyAdded(plugin, currentTime)) {
          categoriesWithNewPlugins.add(category);
        }
      });

      // Create result object starting with "All" tag
      const result: Record<string, { name: string; isNew?: boolean }> = {
        All: { name: "All" },
      };

      // Process categories that have plugins, add them to result
      Object.entries(this.categories)
        .filter(([, category]) => categoriesWithPlugins.has(category.name))
        .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        .forEach(([key, category]) => {
          result[key] = {
            ...category,
            isNew: categoriesWithNewPlugins.has(category.name),
          };
        });

      return result;
    },
  },
  watch: {
    categories: {
      handler(newTags) {
        if (
          !(newTags as Record<string, unknown>)[this.activeTag] &&
          this.activeTag !== "All"
        ) {
          this.activeTag = "All";
          emitter.emit("tag:active", this.activeTag);
        }
      },
      deep: true,
    },
  },
  components: { Tag },
});
</script>

<style scoped>
.element {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex-shrink: 0;
  padding: 6px 12px 8px;
}
</style>
