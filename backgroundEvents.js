const {
    onInstalled,
    onStartup,
    onSuspend,
    onSuspendCanceled
  } = chrome.runtime;
  
onStartup.addListener(onStartupListener);
onInstalled.addListener(onInstalledListener);
onSuspend.addListener(onSuspendListener);
onSuspendCanceled.addListener(onSuspendCanceledListener);

export function onStartupListener() {
    chrome.tabs.query({ active: true }, tabs => { tabs.forEach((tab) => chrome.pageAction.show(tab.id)); })
    console.info(`[DEBUG] Fired when a profile that has this extension installed first starts up.
      This event is not fired when an incognito profile is started,
      even if this extension is operating in 'split' incognito mode.`);
}

export function onInstalledListener() {
    chrome.tabs.query({ active: true }, tabs => { tabs.forEach((tab) => chrome.pageAction.show(tab.id)); })
    console.info(`[DEBUG] Fired when the extension is first installed,
      when the extension is updated to a new version,
      and when Chrome is updated to a new version.`);
}

export function onSuspendListener() {
    console.info(`[DEBUG] Sent to the event page just before it is unloaded.
      This gives the extension opportunity to do some clean up.
      Note that since the page is unloading, any asynchronous operations started while handling this event are not guaranteed to complete.
      If more activity for the event page occurs before it gets unloaded the onSuspendCanceled event will be sent and the page won't be unloaded.`);
}

export function onSuspendCanceledListener() {
    console.info(`[DEBUG] Sent after onSus pend to indicate that the app won't be unloaded after all.`);
}