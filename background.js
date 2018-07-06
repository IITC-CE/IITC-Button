import { plugins } from "./pluginlist.js";

import {
  onInstalledListener,
  onStartupListener,
  onSuspendListener,
  onSuspendCanceledListener,
} from './backgroundEvents.js';

let activeIITCTab = null;
const pluginlist = plugins;
const {
  onActivated,
  onUpdated,
  onRemoved
} = chrome.tabs;
// tab
onActivated.addListener(onActivatedListener);
onUpdated.addListener(onUpdatedListener);
onRemoved.addListener(onRemovedListener);
// page_action
chrome.pageAction.onClicked.addListener(onPageActionClickListener)

// tab listeners
async function onUpdatedListener(tabId, status) {
  if (status.status) {
    console.log(JSON.stringify(status));
    console.log(status.status, ':tab updated #', tabId);

    const {
      active,
      url
    } = await getTabInfo(tabId);
    if (tabId === activeIITCTab) {
      activeIITCTab = null;
      console.log('remove activeIITCTab');
      if(status.status === 'loading' && status.url) {
        console.info('navigate to %s', status.url);
      }
    }
    console.log('tab is active: ', active);
    if (active) {
      chrome.pageAction.show(tabId);
    } else return false

    if (status.status === 'complete') {
      if (/ingress.com\/intel/.test(url)) {
        console.log('detected ingress.com/intel page on active tab %d', tabId);
        if (/\?iitc/.test(url)) {
          console.log('requested iitc launch');
          console.log('initializing iitc');
          initialize(tabId);
        }
      }
    }

    return false;
  }
}

function onRemovedListener(tabId) {
  console.log(tabId + ': closing');
  if (activeIITCTab === tabId) {
    activeIITCTab = null;
    console.log('removed iitc flags')
  }
}

async function onActivatedListener({
  tabId,
  url
}) {
  if (!tabId) {
    throw new Error('not tabId found')
  }
  console.log('tab activated #', tabId, url);

  const {
    active
  } = await getTabInfo(tabId);
  if (active) chrome.pageAction.show(tabId);
}

async function onPageActionClickListener({
  id
}) {
  if (!id) return;
  const {
    active,
    url
  } = await getTabInfo(id);
  if (activeIITCTab) {
    console.log('found activeIITCTab %s', activeIITCTab);
    return setTabActive(activeIITCTab);
  }
  if (active) {
    if (/ingress.com\/intel/.test(url)) {
      console.log('detected ingress.com/intel page on active tab %d', id);
      return chrome.tabs.executeScript({
        code: 'location.assign("?iitc")'
      });
    }

    return chrome.tabs.create({
      url: 'https://ingress.com/intel?iitc',
      pinned: true
    }, function(tab) {
      activeIITCTab = tab.id;
    });
  }
}

function initialize(tabId) {
  if (activeIITCTab) {
    setTabActive(activeIITCTab);
  } else {
    /* Example */
    const activePluginList = [
      './plugins/player-tracker.user.js'
    ];
    console.log(activePluginList, pluginlist)
    /* Example end */
    loadPlugins(tabId, pluginlist);

    chrome.tabs.executeScript(tabId, {
      runAt: "document_start",
      file: './scripts/total-conversion-build.user.js'
    }, () => activeIITCTab = tabId );

  }
}

function loadPlugins(tabId, list) {
  if(!tabId) { console.log('no tabId!'); return}
  if(!list) { console.log('no plugins!'); return}

  list.forEach(function(file) {
    chrome.tabs.executeScript(tabId, {
      runAt: "document_idle",
      file
    }, () => {
      console.info('plugin %s loaded', file);
    });
  });
}

function setTabActive(tabId) {
  chrome.tabs.update(tabId, {
    active: true
  }, (tab) => { setWindowFocused(tab.windowId) });
}

function setWindowFocused(windowId) {
  chrome.windows.update(windowId, { focused: true });
}

function getTabInfo(tabId) {
  return new Promise(resolve => chrome.tabs.get(tabId, resolve));
}

/* function togglePageAction(state, id) {
  state = state ? 'show' : 'hide';

  chrome.pageAction.setIcon({ tabId: id, path: state ? "assets/images/48/logo.png" : "assets/images/19/logo-ok.png" });
  chrome.pageAction.setTitle({ tabId: id, title: state ? "open IITC" : "Intel Ingress Enable is Activated" });
  chrome.pageAction[state](id);
} */

function createTestNotifications(tabId, message) {
  chrome.notifications.create(undefined, {
    type: 'basic',
    title: 'Test notif',
    iconUrl: './logo.png',
    message: message || 'empty'
  })
}
