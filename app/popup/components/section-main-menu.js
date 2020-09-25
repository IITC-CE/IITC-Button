//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

let ComponentMainMenu = Vue.component('section-main-menu', {
  template: '#section-main-menu-template',
  props: {
    'showProgressbar': Boolean,
    'iitc_is_enabled': Boolean,
    'categories': Object,
    'plugins_flat': Object
  },
  mixins: [mixin],
  methods: {
    'openIITC': function () {
      chrome.runtime.sendMessage({'type': "requestOpenIntel"});
      window.close();
    },
    'openOptions': function () {
      document.body.id = "options";
      checkStatusLocalServer(app.$data.localServerHost);
    },
    'openCategory': function (category_name) {
      document.body.id = "plugins";
      this.$root.$data.category_name = category_name;

      this.$root.$data.plugins = Object.entries(this.$root.$data.plugins_flat).reduce(function (category_plugins, plugin_pair) {
        const [plugin_uid, plugin_obj] = plugin_pair;
        if (plugin_obj['category'] === category_name) {
          category_plugins[plugin_uid] = plugin_obj;
        }
        return category_plugins;
      }, {});
    },
    'countPlugins': function (categories, plugins) {
      Object.keys(categories).forEach(function (cat) {
        const [count_plugins, count_plugins_active] = Object.entries(plugins).reduce(function (counter_pair, plugin_pair) {
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
    },
    'sortCategories': function(obj) {

      if (obj === undefined) {
        return {}
      }

      let arr = Object.keys(obj).map(function(key){
        return obj[key];
      });

      for (let i=0;i<arr.length;i++) {
        for (let j=i+1; j<arr.length; j++) {
          if (this.__('name', arr[i]).toLowerCase() > this.__('name', arr[j]).toLowerCase()) {
            let swap = arr[i];
            arr[i] = arr[j];
            arr[j] = swap;
          }
        }
      }

      // Move "Misc" to bottom
      let el_misc = null;
      for (let i=0;i<arr.length;i++) {
        if (arr[i].name.toLowerCase() === 'misc') el_misc = i;
      }
      if (el_misc !== null) arr.push(arr.splice(el_misc,1)[0]);

      return arr;
    }
  },
  computed: {
    'iitc_is_enabled_toggle': {
      get: function () {
        return this.iitc_is_enabled;
      },
      set: function (newValue) {
        this.$emit('update:iitc_is_enabled', newValue)
        chrome.runtime.sendMessage({'type': "toggleIITC", 'value': newValue});
      }
    }
  }
});