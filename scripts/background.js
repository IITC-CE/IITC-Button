let lastIITCTab = null;
const {
  onUpdated,
  onRemoved
} = chrome.tabs;
// tab
onUpdated.addListener(onUpdatedListener);
onRemoved.addListener(onRemovedListener);

chrome.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "requestOpenIntel":
      onRequestOpenIntel().finally();
      break;
    case "toggleIITC":
      onToggleIITC(request.value).finally();
      break;
  }
});
// Handler .user.js
chrome.webNavigation.onBeforeNavigate.addListener(
  function (requestDetails) {
    chrome.tabs.create({
      url: chrome.extension.getURL('/app/jsview/main.html?url='+requestDetails.url)
    });
  },
  {url: [{pathSuffix: ".user.js"}]}
);


async function onRequestOpenIntel() {
  if (lastIITCTab) {
    const tabInfo = await getTabInfo(lastIITCTab);
    if (isIngressUrl(tabInfo.url)) {
      console.log('detected ingress.com/intel page on tab %d', lastIITCTab);
      return setTabActive(lastIITCTab);
    }
  }

  return chrome.tabs.create({
    url: 'https://intel.ingress.com/intel',
    pinned: true
  }, function(tab) {
    lastIITCTab = tab.id;
  });
}

async function onToggleIITC(value) {
  chrome.storage.local.set({'IITC_is_enabled': value}, async function() {

    // Fetch all completly loaded Ingress Intel tabs
    chrome.tabs.query({
        "url": "https://intel.ingress.com/*",
        "status": "complete"
    }, function (tabs) {

      for (let tab of Object.values(tabs)) {
        chrome.tabs.reload(tab.id);
      }

    });
  });

}


// tab listeners
async function onUpdatedListener(tabId, status) {
  if (status.status) {
    if (status.status === 'complete') {
      const tabInfo = await getTabInfo(tabId);
      if (isIngressUrl(tabInfo.url)) {
        console.log('detected intel.ingress.com/intel page on tab %d', tabId);
        console.log('requested iitc launch');
        initialize();
        lastIITCTab = tabId;
      }
    }
    return false;
  }
}

function onRemovedListener(tabId) {
  if (lastIITCTab === tabId) {
    lastIITCTab = null;
  }
}

function initialize() {

  chrome.storage.local.get([
    "IITC_is_enabled",
    "channel",
    "release_iitc_code",     "test_iitc_code",     "local_iitc_code",
    "release_iitc_version",  "test_iitc_version",  "local_iitc_version",
    "release_plugins_local", "test_plugins_local", "local_plugins_local",
    "release_plugins_user",  "test_plugins_user",  "local_plugins_user"
  ], function(data) {

    if (data.channel) channel = data.channel;

    let status = data['IITC_is_enabled'];
    let iitc_code = data[channel+'_iitc_code']
    let iitc_version = data[channel+'_iitc_version'];
    if ((status === undefined || status === true) && iitc_code !== undefined) {


        let inject_iitc_code = preparationUserScript({'version': iitc_version, 'code': iitc_code});
        injectUserScript(inject_iitc_code);

        let plugins_local = data[channel+'_plugins_local'];
        if (plugins_local !== undefined) {
        Object.keys(plugins_local).forEach(function(id) {
          let plugin = plugins_local[id];
          if (plugin['status'] === 'on') {
            injectUserScript(preparationUserScript(plugin, id));
          }
        });
        }

        let plugins_user = data[channel+'_plugins_user'];
        if (plugins_user !== undefined) {
        Object.keys(plugins_user).forEach(function(id) {
          let plugin = plugins_user[id];
          if (plugin['status'] === 'on') {
            injectUserScript(preparationUserScript(plugin, id));
          }
        });
        }



    }
  });

}


function injectUserScript(code) {
  let inject = `
    document.dispatchEvent(new CustomEvent('IITCButtonInitJS', {
      detail: `+JSON.stringify(code)+`
    }));
  `
  // Fetch all completly loaded Ingress Intel tabs
  chrome.tabs.query({
      "url": "https://intel.ingress.com/*",
      "status": "complete"
  }, function (tabs) {

    for (let tab of Object.values(tabs)) {
      console.log(tab);
      chrome.tabs.executeScript(tab.id, {
        code: inject
      }, () => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
      });
    }

  });

}

function setTabActive(tabId) {
  chrome.tabs.update(tabId, {
    active: true
  }, async (tab) => {
    try {
      setWindowFocused(tab.windowId)
    } catch (e) {
      console.log(e);
      lastIITCTab = null;
      console.log('repeated click with updated params');
      onRequestOpenIntel().finally();
    }
  });
}

function setWindowFocused(windowId) {
  chrome.windows.update(windowId, { focused: true });
}

function getTabInfo(tabId) {
  return new Promise(resolve => chrome.tabs.get(tabId, resolve));
}

function isIngressUrl(url) {
  if (url) {
    return (/intel.ingress.com/.test(url))
  }
  return false
}
