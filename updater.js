checkUpdates();

chrome.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "managePlugin":
      managePlugin(request.id, request.category, request.action);
      break;
  }
});

let ajaxGet = function (url, parseJSON, callback) {
  var callback = (typeof callback == 'function' ? callback : false), xhr = null;
  xhr = new XMLHttpRequest();
  if (!xhr) return null;
  xhr.open("GET", url,true);
  xhr.onreadystatechange=function() {
    if (xhr.readyState === 4 && callback) {
      showProgress(false);
      if (xhr.status === 200) {
        let response = xhr.responseText;
        if (parseJSON) {
          response = JSON.parse(response);
        }
        callback(response)
      } else {
        callback(null)
      }
    }
  };
  xhr.send(null);
  showProgress(true);
  return xhr;
};

// If popup is closed, message goes nowhere and an error occurs. Ignore.
function showProgress(value) {
  chrome.runtime.sendMessage({'type': "showProgressbar", 'value': value}, function () {
    if(chrome.runtime.lastError) { }
  });
}

function checkUpdates() {
  chrome.storage.local.get(["release_iitc_version", "release_plugins", "release_plugins_local"], function(local){

    if (local.release_iitc_version === undefined) {
      console.log('needUpdate - first start');
      downloadMeta(local);
    } else {
      ajaxGet("https://iitc.modos189.ru/updates.json", true, function (response) {
        if (response && response.release !== local.release_iitc_version) {
          console.log('needUpdate - new version');
          downloadMeta(local);
        }
      });
    }

  });
}

function preparationCategories(unordered_categories) {

  let categories = {};
  Object.keys(unordered_categories).sort().forEach(function(cat) {
    if (!["Obsolete", "Deleted"].includes(cat)) {

      let plugins = {};
      let count_plugins = 0;
      unordered_categories[cat]['plugins'].forEach(function(plugin) {
        if (plugins[plugin['id']] === undefined) {
          plugin['status'] = 'off';
          plugins[plugin['id']] = plugin;
          count_plugins += 1;
        }
      });
      if (count_plugins > 0) {
        categories[cat] = unordered_categories[cat];
        categories[cat]['plugins'] = plugins;
        categories[cat]['count_plugins'] = count_plugins;
        categories[cat]['count_plugins_active'] = 0;
      }
    }
  });
  console.log(unordered_categories);
  return categories;
}

function downloadMeta(local) {
  ajaxGet("https://iitc.modos189.ru/release.json", true, function (response) {

    let categories = preparationCategories(response.release_plugins);
    chrome.storage.local.set({
      'release_iitc_version': response.release_iitc_version,
      'release_plugins': categories
    });
    console.log('download total-conversion-build.user.js');
    ajaxGet("https://iitc.modos189.ru/build/release/total-conversion-build.user.js", false, function (response) {
      if (response) {
        chrome.storage.local.set({
          'release_iitc': response
        });
      }
    });
    updatePluginsLocal(categories, local, response);
  });
}

function updatePluginsLocal(categories, local, response) {
  let plugins_local = local.release_plugins_local;

  // No plugins installed
  if (plugins_local === undefined) return;

  console.log(plugins_local);
  // Iteration local plugins
  Object.keys(plugins_local).forEach(function(id) {
    console.log(id);

    let filename = null;

    // Iteration meta categories
    Object.keys(categories).forEach(function(cat) {
      if (filename === undefined && categories[cat]['plugins'][id] !== undefined) {
        filename = categories[cat]['plugins'][id]['filename'];
        categories[cat]['count_plugins_active'] += 1;

        if (filename) {
          categories[cat]['plugins'][id]['status'] = 'on';
          ajaxGet("https://iitc.modos189.ru/build/release/plugins/"+filename, false, function (response) {});
        } else {
          delete plugins_local[id];
        }
      }
    });
  });

  chrome.storage.local.set({
    'release_plugins': categories
  });
}

function managePlugin(id, category, action) {
  chrome.storage.local.get(["release_plugins", "release_plugins_local"], function(local) {
    let plugins = local.release_plugins;
    console.log(plugins[category]);
    let plugins_local = local.release_plugins_local;
    if (action === 'on') {

      if (plugins_local !== undefined && plugins_local[id] !== undefined) {
        // Protection against erroneous double activation
        if (plugins[category]['plugins'][id]['status'] !== 'on') {
          plugins[category]['count_plugins_active'] += 1;
        }
        plugins[category]['plugins'][id]['status'] = 'on';
        plugins_local[id]['status'] = 'on';

        chrome.storage.local.set({
          'release_plugins': plugins,
          'release_plugins_local': plugins_local,
        });
      } else {
        if (plugins_local === undefined) {
          plugins_local = {};
        }
        let filename = plugins[category]['plugins'][id]['filename'];
        ajaxGet("https://iitc.modos189.ru/build/release/plugins/"+filename, false, function (response) {
          if (response) {
            plugins[category]['plugins'][id]['status'] = 'on';
            plugins[category]['count_plugins_active'] += 1;
            plugins_local[id] = {
              'filename': filename,
              'status': 'on',
              'code': response
            };
            chrome.storage.local.set({
              'release_plugins': plugins,
              'release_plugins_local': plugins_local,
            });
          }
        });
      }

    }
    if (action === 'off') {

      // Protection against erroneous double activation
      if (plugins[category]['plugins'][id]['status'] !== 'off') {
        plugins[category]['count_plugins_active'] -= 1;
      }
      plugins[category]['plugins'][id]['status'] = 'off';
      plugins_local[id]['status'] = 'off';

      chrome.storage.local.set({
        'release_plugins': plugins,
        'release_plugins_local': plugins_local,
      });

    }
  });
}