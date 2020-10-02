//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const loaded_plugins = [];
let sandbox = 'window.plugin = {};window.plugin.missions = true;';

function getPlayerData() {
  if (window.wrappedJSObject) {
    window.PLAYER = window.wrappedJSObject.PLAYER;
  } else {

    // Chrome does not provide access to WINDOW.
    // Old IITC code is used to retrieve user data.
    const scr = document.getElementsByTagName('script');
    let d;
    for (let x in scr) {
      let s = scr[x];
      if (s.src) continue;
      if (s.type !== 'text/javascript') continue;
      d = s.innerHTML.split('\n');
      break;
    }

    if (!d) {
      // page doesn’t have a script tag with player information.
      if (document.getElementById('header_email')) {
        // however, we are logged in.
        // it used to be regularly common to get temporary 'account not enabled' messages from the intel site.
        // however, this is no longer common. more common is users getting account suspended/banned - and this
        // currently shows the 'not enabled' message. so it's safer to not repeatedly reload in this case
        // setTimeout('location.reload();', 3*1000);
        throw("Page doesn't have player data, but you are logged in.");
      }
      // FIXME: handle nia takedown in progress
      throw("Couldn't retrieve player data. Are you logged in?");
    }

    for (let i = 0; i < d.length; i++) {
      if (!d[i].match('var PLAYER = ')) continue;
      sandbox += d[i]+'window.PLAYER = PLAYER;';
      break;
    }

  }
}

function preparePage() {

  const injectCode = "window.onload = function() {}; document.body.onload = function() {};";

  const script = document.createElement('script');
  script.textContent = injectCode;
  (document.head||document.documentElement).appendChild(script);

  getPlayerData();

  document.addEventListener('IITCButtonInitJS', function (e) {
    const code = e.detail;

    const GM_info_raw = code.substring(0, code.indexOf(";/* END GM_info */"));
    const GM_info = new Function("GM_info", GM_info_raw+';return GM_info')();
    const id = GM_info.script.name;

    if (loaded_plugins.includes(id)) {
      console.debug(`Plugin ${id} is already loaded. Skip`);
    } else {
      loaded_plugins.push(id);
      console.debug(`Plugin ${id} loaded`);
      new Function(sandbox+code)();
    }

  });
}

browser.storage.local.get(["IITC_is_enabled"]).then((data) => {
  if (data["IITC_is_enabled"] !== false) {
    preparePage();
  }
});
