let updateChannelsData = {
  release: {name: 'Release', value: 'release', checked: true},
  test: {name: 'Test builds', value: 'test', checked: false},
  local: {name: 'Local server', value: 'local', checked: false}
};
let updateIntervalsData = [
  {name: 'Every 6 Hours', value: '6'},
  {name: 'Every 12 Hours', value: '12'},
  {name: 'Every Day', value: '24'},
  {name: 'Every Week', value: '168'}
];
let updateChannel = 'release';

let ractive = new Ractive({
  target: '#target-ractive',
  template: '#template-ractive',
  data: {
    'categories': {},
    'plugins': {},
    'updateChannel': updateChannel,
    'updateChannels': updateChannelsData,
    'updateIntervals': updateIntervalsData,
    'category_name': ''
  }
});

let message_timeout_id = null;
function showMessage(msg) {
  let block = document.getElementById("message");
  block.innerText = msg;
  block.classList.add("open");
  clearTimeout(message_timeout_id);
  message_timeout_id = setTimeout(function(){
    block.classList.remove("open");
  }, 3000);
}

ractive.on({
  'openIITC': function (event) {
    event.original.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.runtime.sendMessage({'type': "requestOpenIntel", 'tab': tabs[0].id});
      window.close();
    })
  },
  'toggleIITC': function (event) {
    var checkedValue = document.querySelector('#toggleIITC').checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.runtime.sendMessage({'type': "toggleIITC", 'value': checkedValue});
    })
  },
  'open-link': function (event) {
    chrome.tabs.create({
      url: event.node.getAttribute( 'data-href' )
    });
    window.close();
  },
  'back': function (event) {
    document.body.id = "main-menu";
  },
  'open-options': function (event) {
    document.body.id = "options";
    checkStatusLocalServer();
  },
  'open-category': function (event) {
    document.body.id = "plugins";
    let category_name = event.node.getElementsByTagName("span")[0].innerHTML;
    ractive.set('category_name', category_name);

    let plugins = ractive.get('categories')[category_name]['plugins'];
    Object.keys(plugins).forEach(function(id) {
      if (plugins[id]['status'] === 'user') {
        plugins[id]['icon'] = 'close';
      } else {
        plugins[id]['icon'] = 'toggle_' + plugins[id]['status'];
      }
    });
    // Hack to reset the list of plugins.
    // Otherwise, duplicate plugins (observed when switching from category UserScripts) are moved to top of the list.
    ractive.set('plugins', {});
    ractive.set('plugins', plugins);
  },
  'manage-plugin': function (event) {
    let plugin_id = event.node.getAttribute( 'data-id' );
    let plugin_category = event.node.getAttribute( 'data-category' );
    let status = event.node.getElementsByClassName("element__action")[0].textContent;

    if (event.node.getAttribute( 'data-prevent' ) === 'true') {
      event.node.setAttribute( 'data-prevent', 'false' );
      return;
    }

    let action = null;
    if (status === 'toggle_on') {
      action = "off";
      event.node.classList.remove("on");
      event.node.classList.add('off');
      event.node.getElementsByClassName("element__action")[0].textContent = 'toggle_off';
    } else if (status === 'toggle_off') {
      action = "on";
      event.node.classList.remove("off");
      event.node.classList.add('on');
      event.node.getElementsByClassName("element__action")[0].textContent = 'toggle_on';
    } else if (status === 'close') {
      action = "delete";
      event.node.classList.remove("user");
      event.node.classList.add('off');
      if (event.node.getElementsByClassName("element__user")[0]) {
        event.node.getElementsByClassName("element__user")[0].remove();
      } else {
        event.node.remove();
      }
      event.node.getElementsByClassName("element__action")[0].textContent = 'toggle_off';
    }
    showMessage("Changes will be applied after rebooting Intel");
    chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': plugin_category, 'action': action});
  },
  'delete-plugin': function (event) {
    event.node.parentNode.getElementsByClassName("element__action")[0].textContent = 'close';
  },
  'open-support-url': function (event) {
    event.node.parentNode.setAttribute( 'data-prevent', 'true' );
    ractive.fire('open-link', event);
  },
  'save-plugin': function (event) {
    event.node.parentNode.setAttribute( 'data-prevent', 'true' );
    let id = event.node.parentNode.getAttribute( 'data-id' );
    chrome.storage.local.get([updateChannel+"_plugins_user"], function(data) {
      let plugin = data[updateChannel+"_plugins_user"][id];
      saveJS(plugin['code'], plugin['filename']);
    });
  },
  'change-update-channel': function (event) {
    updateChannel = event.node.value;
    chrome.storage.local.set({
      'update_channel': updateChannel
    }, function () {
      chrome.runtime.sendMessage({'type': "forceFullUpdate"});
      ractive.set('updateChannel', updateChannel);
    });
    showMessage("Update in progress…");
  },
  'change-release-update-check-interval': function (event) {
    let val = event.node.value;
    chrome.storage.local.set({
      'release_update_check_interval': val
    }, function() {
      chrome.runtime.sendMessage({'type': "safeUpdate"});
      showMessage("Changes were applied");
    });
  },
  'change-test-update-check-interval': function (event) {
    let val = event.node.value;
    chrome.storage.local.set({
      'test_update_check_interval': val
    }, function() {
      chrome.runtime.sendMessage({'type': "safeUpdate"});
      showMessage("Changes were applied");
    });
  },
  'change-external-update-check-interval': function (event) {
    let val = event.node.value;
    chrome.storage.local.set({
      'external_update_check_interval': val
    }, function() {
      chrome.runtime.sendMessage({'type': "externalUpdate"});
      showMessage("Changes were applied");
    });
  },
  'force_update': function (event) {
    chrome.runtime.sendMessage({'type': "forceFullUpdate"});
    showMessage("Update in progress…");
  },
  'input-local-server': function () {
    checkStatusLocalServer();
  },
  'change-local-server': function () {
    let host = document.getElementById("local-server__input__host").value;
    let channel = document.getElementById("local-server__input__channel").value;
    chrome.storage.local.set({
      'local_server_host': "http://"+host,
      'local_server_channel': channel
    }, function() {
      if (updateChannel === 'local') {
        ractive.fire("force_update");
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "showProgressbar":
      let element = document.getElementById("progressbar");
      if (request.value) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
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
  "local_server_channel",
  "release_plugins",               "test_plugins",               "local_plugins",
  "release_update_check_interval", "test_update_check_interval", "external_update_check_interval"
], function(data) {

  if (data.update_channel) {
    updateChannelsData.release.checked = (data.update_channel === 'release');
    updateChannelsData.test.checked = (data.update_channel === 'test');
    updateChannelsData.local.checked = (data.update_channel === 'local');
    ractive.set('updateChannels', updateChannelsData);
    updateChannel = data.update_channel;
  }
  ractive.set('updateChannel', updateChannel);

  // initialize categories
  ractive.set('categories', data[updateChannel+'_plugins']);

  // initialize toggleIITC
  let status = data.IITC_is_enabled;
  if (status === false) {
    document.querySelector('#toggleIITC').checked = false
  }

  ['release', 'test', 'external'].forEach(function(channel) {
    let update_check_interval = data[channel+'_update_check_interval'];
    if (!update_check_interval) update_check_interval = 24;
    document.getElementById(channel+"_update_check_interval").value = update_check_interval;
  });

  if (data.local_server_host) document.getElementById("local-server__input__host").value = data.local_server_host.replace("http://", "");
  if (data.local_server_channel) document.getElementById("local-server__input__channel").value = data.local_server_channel;
});



chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
    if (key === updateChannel+"_plugins") {
      ractive.set('categories', {});
      ractive.set('categories', storageChange.newValue);
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

function checkStatusLocalServer() {
  let host = document.getElementById("local-server__input__host").value;
  let channel = document.getElementById("local-server__input__channel").value;

  document.getElementById("local-server__input__host").classList.remove("local-server__input__ok");
  document.getElementById("local-server__input__host").classList.add("local-server__input__err");
  document.getElementById("local-server__input__channel").classList.remove("local-server__input__ok");
  document.getElementById("local-server__input__channel").classList.add("local-server__input__err");

  let xhr1 = new XMLHttpRequest();
  xhr1.open("GET", "http://" + host, true);
  xhr1.timeout = 1000;
  xhr1.onreadystatechange = function() {
    if (xhr1.readyState === 4 && xhr1.status === 200) {
      document.getElementById("local-server__input__host").classList.remove("local-server__input__err");
      document.getElementById("local-server__input__host").classList.add("local-server__input__ok");
    }
  };
  xhr1.send(null);


  let xhr2 = new XMLHttpRequest();
  xhr2.open("GET", "http://" + host + "/" + channel + ".json", true);
  xhr2.timeout = 1000;
  xhr2.onreadystatechange = function() {
    if (xhr2.readyState === 4 && xhr2.status === 200) {
      document.getElementById("local-server__input__channel").classList.remove("local-server__input__err");
      document.getElementById("local-server__input__channel").classList.add("local-server__input__ok");
    }
  };
  xhr2.send(null);
}