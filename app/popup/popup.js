let ractive = new Ractive({
  target: '#target-ractive',
  template: '#template-ractive',
  data: {
    'categories': {},
    'plugins': {},
    'category_name': ''
  }
});

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
      plugins[id]['icon'] = 'toggle_'+plugins[id]['status'];
    });
    ractive.set('plugins', plugins);
  },
  'manage-plugin': function (event) {
    let plugin_id = event.node.getAttribute( 'data-id' );
    let plugin_category = event.node.getAttribute( 'data-category' );
    let status = event.node.getElementsByClassName("element__action")[0].textContent;

    let action = null;
    console.log('status');
    console.log(status);
    console.log(status === 'toggle_on');
    if (status === 'toggle_on') {
      action = "off";
      event.node.classList.remove("on");
      event.node.classList.add('off');
      event.node.getElementsByClassName("element__action")[0].textContent = 'toggle_off';
    } else {
      action = "on";
      event.node.classList.remove("off");
      event.node.classList.add('on');
      event.node.getElementsByClassName("element__action")[0].textContent = 'toggle_on';
    }

    chrome.runtime.sendMessage({'type': "managePlugin", 'id': plugin_id, 'category': plugin_category, 'action': action});
  },
  'test-progress': function (event) {
      let element = document.getElementById("progressbar");
      if (!(element.classList.contains("active"))) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
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


chrome.storage.local.get(["IITC-is-enabled", "release_plugins"], function(data) {
  // initialize categories
  ractive.set('categories', data.release_plugins);

  // initialize toggleIITC
  let status = data['IITC-is-enabled'];
  if (status === false) {
    document.querySelector('#toggleIITC').checked = false
  }
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

    if (key === "release_plugins") {
      ractive.set('categories', storageChange.newValue);
    }

  }
});