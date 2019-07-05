let ComponentMainMenu = Vue.component('section-main-menu', {
  template: '#section-main-menu-template',
  props: {
    'showProgressbar': Boolean,
    'iitc_is_enabled': Boolean,
    'categories': Object
  },
  mixins: [mixin],
  methods: {
    'openIITC': function () {
      chrome.runtime.sendMessage({'type': "requestOpenIntel"});
      window.close();
    },
    'openOptions': function () {
      document.body.id = "options";
      checkStatusLocalServer(this.localServerHost);
    },
    'openCategory': function (category_name) {
      document.body.id = "plugins";
      this.$root.$data.category_name = category_name;
      this.$root.$data.plugins = this.categories[category_name]['plugins'];
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