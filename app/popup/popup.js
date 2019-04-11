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
    console.log(action);
    chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': plugin_category, 'action': action});
  },
  'delete-plugin': function (event) {
    event.node.parentNode.getElementsByClassName("element__action")[0].textContent = 'close';
  },
  'change-update-channel': function (event) {
    let updateChannel = event.node.value;
    chrome.storage.local.set({
      'update_channel': updateChannel
    }, function () {
      chrome.runtime.sendMessage({'type': "forceUpdate"});
      ractive.set('updateChannel', updateChannel);
    });
    showMessage("Update in progress…");
  },
  'change-update-check-interval': function (event) {
    let val = event.node.value;
    console.log(val);
    chrome.storage.local.set({
      'update_check_interval': val
    });
  },
  'force_update': function (event) {
    chrome.runtime.sendMessage({'type': "forceUpdate"});
    showMessage("Update in progress…");
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
  }
});


chrome.storage.local.get(["IITC_is_enabled", "update_channel", "release_plugins", "test_plugins", "update_check_interval"], function(data) {
  if (data.update_channel) {
    updateChannelsData.release.checked = (data.update_channel === 'release');
    updateChannelsData.test.checked = (data.update_channel === 'test');
    ractive.set('updateChannels', updateChannelsData);
    updateChannel = data.update_channel;
  }
  console.log('update channel (popup): '+updateChannel);
  ractive.set('updateChannel', updateChannel);

  // initialize categories
  ractive.set('categories', data[updateChannel+'_plugins']);

  // initialize toggleIITC
  let status = data.IITC_is_enabled;
  if (status === false) {
    document.querySelector('#toggleIITC').checked = false
  }

  let update_check_interval = data.update_check_interval;
  if (!update_check_interval) {
    update_check_interval = 24;
  }
  document.getElementById("update_check_interval").value = update_check_interval;
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
      ractive.set('categories', storageChange.newValue);
    }

  }
});