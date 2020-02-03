//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

let ComponentOptions = Vue.component('section-options', {
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
    'forceUpdate': function () {
      chrome.runtime.sendMessage({'type': "forceFullUpdate"});
      showMessage(this._("updateInProgress"));
    },
    'changeLocalServer': async function (event) {
      let host = event.target.value;
      if (await checkStatusLocalServer(host)) {
        chrome.storage.local.set({
          'local_server_host': host
        }, function () {
          if (this.channel === 'local') {
            this.forceUpdate()
          }
        });
      }
    }
  },
  computed: {
    'channelSelect': {
      get: function () {
        return this.channel;
      },
      set: function (newValue) {
        this.$emit('update:channel', newValue);
        this.$root.channel = newValue;
        chrome.storage.local.set({
          'channel': newValue
        }, () => {
          this.forceUpdate()
        });
        showMessage(this._("updateInProgress"));
      }
    },
    'release_update_check_interval_select': {
      get: function () {
        return parseInt(this.release_update_check_interval);
      },
      set: function (newValue) {
        saveUpdateInterval('release');
        this.$emit('update:release_update_check_interval', newValue)
      }
    },
    'test_update_check_interval_select': {
      get: function () {
        return parseInt(this.test_update_check_interval);
      },
      set: function (newValue) {
        saveUpdateInterval('test');
        this.$emit('update:test_update_check_interval', newValue)
      }
    },
    'external_update_check_interval_select': {
      get: function () {
        return parseInt(this.external_update_check_interval);
      },
      set: function (newValue) {
        saveUpdateInterval('external');
        this.$emit('update:external_update_check_interval', newValue);
      }
    },
    'localServerHostInput': {
      get: function () {
        return this.localServerHost;
      },
      set: function (newValue) {
        this.$emit('update:localServerHost', newValue)
      }
    }
  }
});

let saveUpdateInterval = (function (channel) {
  let key = channel+'_update_check_interval';
    let setData = {};
    setData[key] = this[key];

    chrome.storage.local.set(setData, () => {
      chrome.runtime.sendMessage({'type': (channel === 'external') ? "externalUpdate" : "safeUpdate"});
      showMessage(this._("changesApplied"));
    });
});