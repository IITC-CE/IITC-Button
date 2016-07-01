// page action
function isOurSite (tab) {
  return tab.url === "https://www.ingress.com/intel";
}
function toggle (state,id) {
  state = state ? 'show': 'hide';
  chrome.pageAction[state](id);
}
function show (id) {
  toggle(true, id);
}
function hide (id) {
  toggle(false, id);
}
chrome.tabs.onActivated.addListener((tabInfo) => {
  var id = tabInfo.tabId;
  chrome.tabs.query({active: true, currentWindow: true }, (tab) => {
    id = tab[0].id;
    if (isOurSite(tab[0])) {
      show(id);
    } else {
      hide(id);
    }
  });
});

chrome.tabs.onUpdated.addListener((id, status, tab) => {
  isOurSite(tab) ? show(id) : hide(id);
});
// ---
chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript({
    runAt: 'document_start',
    file: './total-conversion-build.user.js'
  });
  chrome.tabs.executeScript({
    runAt: 'document_end',
    file: './plugins/map.yandex.js'
  });
  chrome.tabs.executeScript({
    runAt: 'document_end',
    file: './legacyplugins/plugins/basemap-nokia-ovi.user.js'
  });
});
