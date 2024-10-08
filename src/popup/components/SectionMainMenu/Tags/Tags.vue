<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="element">
    <Tag
      v-for="(tag, key) in tags"
      :key="key"
      :tag="tag"
      :isActive="tag.name === activeTag"
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
  computed: {
    tags() {
      if (this.all_plugins === undefined) {
        return {};
      }

      const sortedTags = Object.entries(this.categories)
        .filter(([, category]) => {
          return Object.values(this.all_plugins).some(
            (plugin) => plugin.category === category.name
          );
        })
        .sort((a, b) => a[1].name.localeCompare(b[1].name));

      return {
        All: { name: "All" },
        ...Object.fromEntries(sortedTags),
      };
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
