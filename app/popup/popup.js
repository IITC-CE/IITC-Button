let updateChannelsData = {
  release: {name: 'Release', value: 'release'},
  test: {name: 'Test builds', value: 'test',},
  local: {name: 'Local server', value: 'local'}
};
let updateIntervalsData = [
  {name: 'Every 6 Hours', value: '6'},
  {name: 'Every 12 Hours', value: '12'},
  {name: 'Every Day', value: '24'},
  {name: 'Every Week', value: '168'}
];

let app = new Vue({
  el: '#app',
  data: {
    'IITC_is_enabled': true,
    'categories': {},
    'plugins': {},
    'updateChannel': 'release',
    'updateChannels': updateChannelsData,
    'updateIntervals': updateIntervalsData,
    'release_update_check_interval': 24,
    'test_update_check_interval': 24,
    'external_update_check_interval': 24,
    'category_name': '',
    'message': {'opened': false, 'text': ''},
    'showProgressbar': false,
    'localServerHost': '127.0.0.1:8000',
    'localServerStatus': ''
  },
  methods: {
    'objIsEmpty': function (obj) {
      return ((typeof obj !== 'object') || (Object.keys(obj).length === 0))
    },
    'openIITC': function () {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.sendMessage({'type': "requestOpenIntel", 'tab': tabs[0].id});
        window.close();
      })
    },
    'toggleIITC': function (event) {
      let checkedValue = this.IITC_is_enabled;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.sendMessage({'type': "toggleIITC", 'value': checkedValue});
      })
    },
    'openLink': function (url) {
      chrome.tabs.create({ url: url });
      window.close();
    },
    'back': function () {
      document.body.id = "main-menu";
    },
    'openOptions': function () {
      document.body.id = "options";
      checkStatusLocalServer(this.localServerHost);
    },
    'openCategory': function (category_name) {
      document.body.id = "plugins";
      this.category_name = category_name;

      let plugins = this.categories[category_name]['plugins'];
      Object.keys(plugins).forEach(function(id) {
        plugins[id]['icon'] = (plugins[id]['status'] === 'user') ? 'close' : 'toggle_' + plugins[id]['status'];
      });
      // Hack to reset the list of plugins.
      // Otherwise, duplicate plugins (observed when switching from category UserScripts) are moved to top of the list.
      this.plugins = {};
      this.plugins = plugins;
    },
    'managePlugin': function (plugin_id, plugin_category, status) {
      let action = null;
      if (status === 'on') {
        action = "off";
      } else {
        action = "on";
      }
      this.plugins[plugin_id].status = action;
      this.plugins[plugin_id].icon = 'toggle_'+action;
      showMessage("Changes will be applied after rebooting Intel");
      chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': plugin_category, 'action': action});
    },
    'deletePlugin': function (plugin_id, plugin_category) {
      delete this.plugins[plugin_id];
      showMessage("Changes will be applied after rebooting Intel");
      chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': plugin_category, 'action': "delete"});
    },
    'openSupportUrl': function (event) {
      this.openLink(event);
    },
    'savePlugin': function (id) {
      chrome.storage.local.get([this.updateChannel+"_plugins_user"], (data) => {
        let plugin = data[this.updateChannel+"_plugins_user"][id];
        saveJS(plugin['code'], plugin['filename']);
      });
    },
    'changeUpdateChannel': function (event) {
      let updateChannel = event.target.value;
      chrome.storage.local.set({
        'update_channel': updateChannel
      });
      showMessage("Update in progress…");
    },
    'changeUpdateCheckInterval': function (type) {
      let key = type+'_update_check_interval';

      let setData = {};
      setData[key] = this[key];

      chrome.storage.local.set(setData, () => {
        chrome.runtime.sendMessage({'type': (type === 'external') ? "externalUpdate" : "safeUpdate"});
        showMessage("Changes were applied");
      });
    },
    'forceUpdate': function () {
      chrome.runtime.sendMessage({'type': "forceFullUpdate"});
      showMessage("Update in progress…");
    },
    'changeLocalServer': function () {
      let host = event.target.value;
      if (checkStatusLocalServer(host)) {
        chrome.storage.local.set({
          'local_server_host': "http://" + host
        }, function () {
          if (this.updateChannel === 'local') {
            this.forceUpdate();
          }
        });
      }
    }
  }
});

let message_timeout_id = null;
function showMessage(msg) {
  app.$data.message.text = msg;
  app.$data.message.opened = true;

  clearTimeout(message_timeout_id);
  message_timeout_id = setTimeout(function(){
    app.$data.message.opened = false;
  }, 3000);
}

chrome.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "showProgressbar":
      app.$data.showProgressbar = request.value;
      break;
    case "showMessage":
      showMessage(request.message);
      break;
  }
});


chrome.storage.local.get([
  "IITC_is_enabled",
  "update_channel",
  "local_server_host",
  "release_plugins",               "test_plugins",               "local_plugins",
  "release_update_check_interval", "test_update_check_interval", "external_update_check_interval"
], function(data) {

  if (data.update_channel) {
    app.$data.updateChannel = data.update_channel;
  }

  // initialize categories
  app.$data.categories = data[app.$data.updateChannel+'_plugins'];

  // initialize toggleIITC
  let status = data.IITC_is_enabled;
  if (status === false) {
    app.$data.IITC_is_enabled = false
  }

  ['release', 'test', 'external'].forEach(function(channel) {
    let update_check_interval = data[channel+'_update_check_interval'];
    if (update_check_interval) {
      app.$data[channel+"_update_check_interval"] = update_check_interval;
    }
  });

  if (data.local_server_host) {
    app.$data.localServerHost = data.local_server_host.replace("http://", "");
  }
});



chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    // console.log('Storage key "%s" in namespace "%s" changed. ' +
    //             'Old value was "%s", new value is "%s".',
    //             key,
    //             namespace,
    //             storageChange.oldValue,
    //             storageChange.newValue);
    if (key === app.$data.updateChannel+"_plugins") {
      app.$data.categories = {};
      app.$data.categories = storageChange.newValue;
      let category_name = app.$data.category_name
      if (category_name !== '') {
        let plugins = app.$data.categories[category_name].plugins;
        Object.keys(plugins).forEach(function(id) {
          plugins[id]['title'] = ((category_name === 'UserScripts') ? plugins[id]['icon'] : '') + plugins[id]['desc'];
          plugins[id]['icon'] = (plugins[id]['status'] === 'user') ? 'close' : 'toggle_' + plugins[id]['status'];
        });
        app.$data.plugins = plugins;
      }
    }

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

function checkStatusLocalServer(host) {
  app.$data.localServerStatus = 'err';

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "http://" + host, true);
  xhr.timeout = 1000;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      app.$data.localServerStatus = 'ok';
    }
  };
  xhr.send(null);
}