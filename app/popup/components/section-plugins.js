//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

let ComponentPlugins = Vue.component('section-plugins', {
  template: '#section-plugins-template',
  props: {
    'category_name': String,
    'categories': Object,
    'plugins': Object,
  },
  mixins: [mixin],
  methods: {
    'pluginDescription': function (plugin) {
      return ((this.category_name === 'External') ? '[v'+plugin['version']+'] ' : '') + this.__('description', plugin);
    },
    'pluginIcon': function (plugin) {
      return (plugin['status'] === 'user') ? 'close' : 'toggle_' + plugin['status'];
    },
    'managePlugin': function (plugin_id, status) {
      let action = (status === "on") ? "off" : "on";
      this.plugins[plugin_id].status = action;
      this.plugins[plugin_id].icon = 'toggle_'+action;
      showMessage(this._("needRebootIntel"));
      chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': this.category_name, 'action': action});
    },
    'deletePlugin': function (plugin_id) {
      let plugins = this.categories[this.category_name].plugins;
      delete plugins[plugin_id];
      if (Object.values(plugins).length <= 0) {
        this.back();
        this.categories[this.category_name].name = '';
      }
      showMessage(this._("needRebootIntel"));
      chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': this.category_name, 'action': "delete"});
    },
    'savePlugin': function (id) {
      chrome.storage.local.get([this.$root.channel+"_plugins_user"], (data) => {
        let plugin = data[this.$root.channel+"_plugins_user"][id];
        saveJS(plugin['code'], plugin['filename']);
      });
    },
  }
});

const saveJS = (function () {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        let blob = new Blob([data], {type: "application/x-javascript"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());