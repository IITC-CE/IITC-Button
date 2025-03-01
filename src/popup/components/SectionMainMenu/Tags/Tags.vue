<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
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

<script>
import Tag from "./Tag.vue";

export default {
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
    this.$root.$on("tag:active", (activeTag) => {
      this.activeTag = activeTag;
    });
  },
  methods: {
    /**
     * Checks if a plugin was added within the last hour
     * @param {Object} plugin - Plugin object to check
     * @param {Number} currentTime - Current timestamp in seconds
     * @returns {Boolean} - True if plugin was added within the last hour
     */
    isRecentlyAdded(plugin, currentTime) {
      const oneHourInSeconds = 60 * 60;
      return plugin.addedAt && currentTime - plugin.addedAt <= oneHourInSeconds;
    },
  },
  computed: {
    /**
     * Processes plugin data and generates tags with their states
     * @returns {Object} - Object containing all tags with their properties
     */
    tags() {
      // Return empty object if no plugins data available
      if (!this.all_plugins || !this.categories) return {};

      const currentTime = Date.now() / 1000;
      const categoriesWithPlugins = new Set();
      const categoriesWithNewPlugins = new Set();

      Object.values(this.all_plugins).forEach((plugin) => {
        const category = plugin.category;
        if (!category) return;

        categoriesWithPlugins.add(category);
        if (this.isRecentlyAdded(plugin, currentTime)) {
          categoriesWithNewPlugins.add(category);
        }
      });

      // Create result object starting with "All" tag
      const result = {
        All: {
          name: "All",
        },
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
        if (!newTags[this.activeTag] && this.activeTag !== "All") {
          this.activeTag = "All";
          this.$root.$emit("tag:active", this.activeTag);
        }
      },
      deep: true,
    },
  },
  components: { Tag },
};
</script>

<style scoped>
.element {
  display: flex;
  padding: 4px 6px;
  flex-wrap: wrap;
}
</style>
