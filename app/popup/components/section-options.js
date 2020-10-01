//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const saveUpdateInterval = (async (channel) => {
  const key = channel+'_update_check_interval';
  const setData = {};
  setData[key] = this[key];

  await browser.storage.local.set(setData);
  await browser.runtime.sendMessage({'type': "safeUpdate"});
  showMessage(this._("changesApplied"));
});

const ComponentOptions = Vue.component('section-options', {
  template: '#section-options-template',
  props: {
    'updateChannels': Object,
    'updateIntervals': Array,
    'channel': String,
    'release_update_check_interval': Number,
    'test_update_check_interval': Number,
    'external_update_check_interval': Number,
    'localServerHost': String,
    'localServerStatus': String
  },
  mixins: [mixin],
  methods: {
    'forceUpdate': async function() {
      await browser.runtime.sendMessage({'type': "forceFullUpdate"});
      showMessage(this._("updateInProgress"));
    },
    'changeLocalServer': async function(event) {
      const host = event.target.value;
      if (await checkStatusLocalServer(host)) {
        await browser.storage.local.set({
          'local_server_host': host
        })

        if (this.channel === 'local') {
          await this.forceUpdate()
        }
      }
    }
  },
  computed: {
    'channelSelect': {
      get: function() {
        return this.channel;
      },
      set: async function(newValue) {
        this.$emit('update:channel', newValue);
        this.$root.channel = newValue;
        await browser.storage.local.set({
          'channel': newValue
        })
        showMessage(this._("updateInProgress"));
        await this.forceUpdate();

        const data = await browser.storage.local.get([
          "release_categories",            "test_categories",            "local_categories",
          "release_plugins_flat",          "test_plugins_flat",          "local_plugins_flat"
        ]);

        // reinitialize categories
        this.$root.categories = data[newValue+'_categories'];
        
        // reinitialize all plugins
        this.$root.plugins_flat = data[newValue+'_plugins_flat'];
      }
    },
    'release_update_check_interval_select': {
      get: function() {
        return parseInt(this.release_update_check_interval);
      },
      set: async function(newValue) {
        await saveUpdateInterval('release');
        this.$emit('update:release_update_check_interval', newValue)
      }
    },
    'test_update_check_interval_select': {
      get: function() {
        return parseInt(this.test_update_check_interval);
      },
      set: async function(newValue) {
        await saveUpdateInterval('test');
        this.$emit('update:test_update_check_interval', newValue)
      }
    },
    'external_update_check_interval_select': {
      get: function() {
        return parseInt(this.external_update_check_interval);
      },
      set: async function(newValue) {
        await saveUpdateInterval('external');
        this.$emit('update:external_update_check_interval', newValue);
      }
    },
    'localServerHostInput': {
      get: function() {
        return this.localServerHost;
      },
      set: function(newValue) {
        this.$emit('update:localServerHost', newValue)
      }
    }
  }
});