//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const saveJS = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
    const blob = new Blob([data], {type: "application/x-javascript"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

const ComponentPlugins = Vue.component('section-plugins', {
  template: '#section-plugins-template',
  props: {
    'category_name': String,
    'categories': Object,
    'plugins': Object,
  },
  mixins: [mixin],
  methods: {
    'pluginDescription': function(plugin) {
      return ((plugin['user']) ? `[v${plugin['version']}] ` : '') + this.__('description', plugin);
    },
    'pluginIcon': function(plugin) {
      return `toggle_${plugin['status']}`;
    },
    'managePlugin': async function(plugin_uid, status) {
      let action = "";
      if (status === "user") {
        action = "delete";
        this.plugins[plugin_uid].status = "off";
        this.plugins[plugin_uid].icon = 'toggle_off';
      } else {
        action = (status === "on") ? "off" : "on";
        this.plugins[plugin_uid].status = action;
        this.plugins[plugin_uid].icon = 'toggle_'+action;
      }
      showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({'type': "managePlugin", 'uid': plugin_uid, 'category': this.category_name, 'action': action});
    },
    'deletePlugin': async function(plugin_uid) {
      const cat = this.category_name;
      const plugins = this.$root.$data.plugins;
      if (!plugins[plugin_uid]['override']) delete plugins[plugin_uid];

      const count_plugins = Object.entries(plugins).reduce((total, plugin_pair) => {
        const [, plugin_obj] = plugin_pair;
        if (plugin_obj['category'] === cat) total += 1;
        return total;
      }, 0);

      if (count_plugins <= 0) {
        this.back();
        this.categories[this.category_name].name = '';
      }
      showMessage(this._("needRebootIntel"));
      await browser.runtime.sendMessage({'type': "managePlugin", 'uid': plugin_uid, 'category': this.category_name, 'action': "delete"});
    },
    'savePlugin': async function(uid) {
      const data = await browser.storage.local.get([this.$root.channel+"_plugins_user"]);

      const plugin = data[this.$root.channel+"_plugins_user"][uid];
      saveJS(plugin['code'], plugin['filename']);
    },
  }
});