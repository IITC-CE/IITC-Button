window.iitcLoaded = false;

// page action
function isOurSite (tab) {
  return !!tab.url.match(/ingress.com\/intel/)
}
function toggle (state, id) {
  state = state ? 'show' : 'hide';

  chrome.pageAction.setIcon({ tabId: id, path: state ? "assets/images/48/logo.png" : "assets/images/19/logo-ok.png" });
  chrome.pageAction.setTitle({ tabId: id, title: state ? "Toggle IITC on ingress.com/intel" : "Intel Ingress Enable is Activated" });
  chrome.pageAction[state](id);
}
function show (id) {
  toggle(true, id);
}
function hide (id) {
  toggle(false, id);
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true }, (tab) => {
    const cTab = tab[0];
    const id = cTab.id;
    
    if (window.iitcLoaded) { return; }
    isOurSite(cTab) ? show(id) : hide(id);
  });
});

chrome.tabs.onActivated.addListener((tabInfo) => {
  let id = tabInfo.tabId;
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    id = tab[0].id;
    if (window.iitcLoaded) { return; }
    if (isOurSite(tab[0])) {
      show(id);
    } else {
      hide(id);
    }
  });
});

chrome.tabs.onUpdated.addListener((id, status, tab) => {
  if (window.iitcLoaded) { return; }
  isOurSite(tab) ? show(id) : hide(id);
});

chrome.pageAction.onClicked.addListener((tab) => {
  if (window.iitcLoaded) { return }
  setTimeout(() => {
    hide(tab.id);
  }, 5000);
  const plugins = [
    './plugins/iitc-plugins/less-clutter.user.js',
    './plugins/iitc-plugins/scoreboard.user.js',
    './plugins/iitc-plugins/uniques.user.js',
    './plugins/iitc-plugins/bookmarks-by-zaso.user.js',
    './plugins/iitc-plugins/portal-highlighter-high-level.user.js',
    './plugins/draw-tools.user.js',
    './plugins/portal-highlighter-uniques-opacity.user.js',
    // './plugins/extend-poly-lines.user.js',
    // './plugins/debug-publish-info.user.js',
    // './plugins/minimap-enhanced.user.js',
    // './plugins/chat-tools.user.js',
    // './plugins/uniques-heatmap.user.js',
  ];
  chrome.tabs.executeScript({
    runAt: 'document_start',
    file: './total-conversion-build.user.js',
  });

  plugins.forEach((file) => {
    chrome.tabs.executeScript({
      runAt: 'document_idle',
      file,
    });  
  });
  window.iitcLoaded = true;
});
