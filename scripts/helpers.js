//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

let wait_timeout_id = null;

function _(msg, arg) {
  return browser.i18n.getMessage(msg, arg)
}

function parse_meta(code) {
  const meta = code.split('\n');

  let is_userscript = false;
  const data = {};
  for (let i = 0; i < meta.length; i++) {
    let line = meta[i];
    if (line.indexOf("==UserScript==") > (- 1)) {
      is_userscript = true;
      continue;
    }
    if (line.indexOf("==/UserScript==") > (- 1)) {
        return data;
    }
    if (is_userscript) {
      line = line.trim();
      const sp = line.split(/\s+/);

      const key = sp[1].replace("@", "");
      let value = sp.slice(2).join(" ");
      if (["name", "namespace", "category", "version", "description", "updateURL", "downloadURL", "supportURL"].indexOf(key) !== -1) {
        if (data[key]) continue;
        if (key === "name") {
          value = value.replace("IITC plugin: ", "").replace("IITC Plugin: ", "");
        }
        data[key] = value;
      }
    }
  }
  return data;
}

const ajaxGet = (url, variant) => new Promise((resolve, reject) => {
  const method = (variant === "Last-Modified") ? "HEAD" : "GET";

  const xhr = new XMLHttpRequest();
  if (!xhr) return null;
  xhr.timeout = 10*1000;
  xhr.open(method, url+"?"+Date.now(),true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {

        if (variant === "Last-Modified") {
          resolve(xhr.getResponseHeader('Last-Modified'))
        } else {
          let response = xhr.responseText;
          if (variant === "parseJSON") {
            response = JSON.parse(response);
          }
          resolve(response)
        }

      } else {
        reject(null)
      }
    }
  };
  xhr.send(null);
});

function h(str) {
  if (str === undefined) {
    str = ""
  } else {
    str = str.replace('"', '\\"')
  }
  return str
}

// Implementation of partial sufficient compatibility with GreaseMonkey
function preparationUserScript(plugin, name) {
  if (name === undefined) name = '';

  return `var GM_info = {
            "script": {
              "version": "${h(plugin['version'])}",
              "name": "${h(name)}",
              "description": "${h(plugin['description'])}"
            }
          };/* END GM_info */
          ${plugin['code']}; true`;
}

const checkStatusLocalServer = (host) => new Promise(resolve => {
  app.$data.localServerStatus = 'err';

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `http://${host}/meta.json?${Date.now()}`, true);
  xhr.timeout = 1000;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        app.$data.localServerStatus = 'ok';
        resolve(true)
      } else {
        resolve(false)
      }
    }
  };
  xhr.send(null);
});

function getUID(plugin) {
  const available_fields = [];

  if (plugin['name']) {
    available_fields.push(plugin['name']);
  } else {
    available_fields.push(plugin['filename'])
  }

  if (plugin['namespace']) {
    available_fields.push(plugin['namespace']);
  }

  return available_fields.join("+")
}

async function wait(seconds) {
  return new Promise(resolve => {
    clearTimeout(wait_timeout_id); wait_timeout_id = null;
    wait_timeout_id = setTimeout(resolve, seconds*1000);
  });
}