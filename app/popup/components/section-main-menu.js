//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const ComponentMainMenu = Vue.component('section-main-menu', {
  template: '#section-main-menu-template',
  props: {
    'showProgressbar': Boolean,
    'iitc_is_enabled': Boolean,
    'categories': Object,
    'plugins_flat': Object
  },
  mixins: [mixin],
  methods: {
    'openIITC': async function() {
      await browser.runtime.sendMessage({'type': "requestOpenIntel"});
      window.close();
    },
    'openOptions': function() {
      document.body.id = "options";
      checkStatusLocalServer(app.$data.localServerHost);
    },
    'openCategory': function(category_name) {
      document.body.id = "plugins";
      this.$root.$data.category_name = category_name;

      this.$root.$data.plugins = Object.entries(this.$root.$data.plugins_flat).reduce((category_plugins, plugin_pair) => {
        const [plugin_uid, plugin_obj] = plugin_pair;
        if (plugin_obj['category'] === category_name) {
          category_plugins[plugin_uid] = plugin_obj;
        }
        return category_plugins;
      }, {});
    },
    'countPlugins': function (categories, plugins) {
      if (categories === undefined) return {};

      Object.keys(categories).forEach(cat => {
        const [count_plugins, count_plugins_active] = Object.entries(plugins).reduce((counter_pair, plugin_pair) => {
          const [, plugin_obj] = plugin_pair;
          let [total, active] = counter_pair;
          if (plugin_obj['category'] === cat) {
            total += 1;
            if (plugin_obj['status'] === "on") {
              active += 1;
            }
          }
          return [total, active];
        }, [0, 0]);

        categories[cat]['count_plugins'] = count_plugins;
        categories[cat]['count_plugins_active'] = count_plugins_active;
      })
      return categories
    }
  },
  computed: {
    'iitc_is_enabled_toggle': {
      get: function () {
        return this.iitc_is_enabled;
      },
      set: async function(newValue) {
        this.$emit('update:iitc_is_enabled', newValue)
        await browser.runtime.sendMessage({'type': "toggleIITC", 'value': newValue});
      }
    }
  }
});