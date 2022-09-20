<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="list">
    <Title></Title>
    <SearchBar v-model="search_query"></SearchBar>
    <div class="search-results" v-if="search_query">
      <ElementPlugin
        v-for="(plugin, index) in search_results"
        v-bind:key="index"
        v-bind:category_name="plugin['category']"
        v-bind:plugin="plugin"
      ></ElementPlugin>
      <Element
        v-if="objIsEmpty(search_results)"
        v-bind:text="_('noData')"
      ></Element>
    </div>
    <div class="categories" v-if="!search_query">
      <template
        v-for="(cat, index) in sortIITCObj(
          countPlugins(categories, plugins_flat)
        )"
      >
        <Element
          v-if="cat.name && cat.count_plugins"
          v-bind:key="index"
          v-bind:text="__('name', cat)"
          v-bind:description="__('description', cat)"
          v-bind:icon_name="'keyboard_arrow_right'"
          v-bind:icon_position_is_right="true"
          v-bind:counter="
            cat.count_plugins_active + '&nbsp;/&nbsp;' + cat.count_plugins
          "
          v-on:item_onclick="openCategory(cat.name)"
        ></Element>
      </template>
      <Element
        v-if="objIsEmpty(categories)"
        v-bind:text="_('noData')"
      ></Element>
    </div>
    <div class="item-wrapper">
      <Hr />
    </div>
    <div class="links-grid">
      <Element
        v-bind:class="'list__item_add'"
        v-bind:text="_('addExternalPlugin')"
        v-bind:icon_name="'add'"
        v-on:item_onclick="openLink('/choose_file.html')"
      ></Element>
      <Element
        v-bind:class="'list__item_homepage'"
        v-bind:text="_('iitcHomePage')"
        v-bind:icon_name="'link'"
        v-on:item_onclick="openLink('https://iitc.app')"
      ></Element>
    </div>
  </div>
</template>

<script>
import Title from "./Title";
import SearchBar from "./SearchBar";
import Hr from "./Hr.vue";
import Element from "./Element";
import ElementPlugin from "./ElementPlugin";
import { mixin } from "./mixins.js";
import { searchPlugins } from "@/popup/search";

export default {
  name: "SectionMainMenu",
  props: {
    categories: Object,
    plugins_flat: Object
  },
  data() {
    return {
      search_query: "",
      search_results: {}
    };
  },
  mixins: [mixin],
  methods: {
    openCategory: function(category_name) {
      document.body.id = "plugins";
      this.$parent.$data.category_name = category_name;

      this.$parent.$data.plugins = Object.entries(
        this.$parent.$data.plugins_flat
      ).reduce((category_plugins, plugin_pair) => {
        const [plugin_uid, plugin_obj] = plugin_pair;
        if (plugin_obj["category"] === category_name) {
          category_plugins[plugin_uid] = plugin_obj;
        }
        return category_plugins;
      }, {});
    },
    countPlugins: function(categories, plugins) {
      if (categories === undefined) return {};

      Object.keys(categories).forEach(cat => {
        const [count_plugins, count_plugins_active] = Object.entries(
          plugins
        ).reduce(
          (counter_pair, plugin_pair) => {
            const [, plugin_obj] = plugin_pair;
            let [total, active] = counter_pair;
            if (plugin_obj["category"] === cat) {
              total += 1;
              if (plugin_obj["status"] === "on") {
                active += 1;
              }
            }
            return [total, active];
          },
          [0, 0]
        );

        categories[cat]["count_plugins"] = count_plugins;
        categories[cat]["count_plugins_active"] = count_plugins_active;
      });
      return categories;
    }
  },
  watch: {
    search_query: function(val) {
      if (val === "*") {
        this.search_results = this.sortIITCObj(this.plugins_flat);
      } else {
        this.search_results = searchPlugins(val, this.plugins_flat);
      }
    }
  },
  components: { Title, SearchBar, Hr, Element, ElementPlugin }
};
</script>

<style scoped>
.links-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  font-size: 90%;
}

.categories,
.search-results {
  height: 390px;
  overflow-y: auto;
}
</style>
