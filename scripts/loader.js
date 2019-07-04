let loaded_plugins = [];

document.addEventListener('IITCButtonInitJS', function (e) {
  let code = e.detail;

  let GM_info_raw = code.substring(0, code.indexOf(";"));
  let GM_info = new Function("GM_info", GM_info_raw+';return GM_info')();
  let id = GM_info.script.name;

  if (loaded_plugins.includes(id)) {
    console.info('Plugin %s is already loaded. Skip', id);
  } else {
    loaded_plugins.push(id);
    console.info('Plugin %s loaded', id);

    let script = document.createElement("script");
    script.textContent = 'unsafeWindow = window;'+code;
    (document.body || document.head || document.documentElement).appendChild(script);
  }

});