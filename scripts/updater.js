//@license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

let progressIntervalId = null;
let update_timeout_id = null;
let external_update_timeout_id = null;
checkUpdates();
checkExternalUpdates();

chrome.runtime.onMessage.addListener(function(request) {
  switch (request.type) {
    case "managePlugin":
      managePlugin(request.uid, request.category, request.action);
      break;
    case "safeUpdate":
      checkUpdates(false);
      break;
    case "forceFullUpdate":
      checkUpdates(true);
      checkExternalUpdates(true);
      break;
    case "addUserScripts":
      addUserScripts(request.scripts);
      break;
  }
});

const save = (options) => new Promise(resolve => {
  let data = {};
  Object.keys(options).forEach(function (key) {
    if (['iitc_version', 'last_modified', 'iitc_code', 'categories', 'plugins_flat', 'plugins_local', 'plugins_user'].indexOf(key) !== -1) {
      data[channel+'_'+key] = options[key];
    } else {
      data[key] = options[key];
    }
  });
  chrome.storage.local.set(data, resolve());
});


const ajaxGetWithProgress = (url, variant) => new Promise(async resolve => {
  clearInterval(progressIntervalId);
  progressIntervalId = setInterval(function() { showProgress(true) }, 300);
  let response = await ajaxGet(url, variant);
  if (response) {
    clearInterval(progressIntervalId);
    showProgress(false);
  }
  resolve(response);
});


// If popup is closed, message goes nowhere and an error occurs. Ignore.
function showProgress(value) {
  chrome.runtime.sendMessage({'type': "showProgressbar", 'value': value}, function () {
    if(chrome.runtime.lastError) { }
  });
}

function checkUpdates(force, retry) {
  chrome.storage.local.get([
    "channel",
    "last_check_update",
    "local_server_host",
    "release_update_check_interval", "test_update_check_interval", "local_update_check_interval",
    "release_last_modified",         "test_last_modified",         "local_last_modified",
    "release_categories",            "test_categories",            "local_categories",
    "release_plugins_flat",          "test_plugins_flat",          "local_plugins_flat",
    "release_plugins_local",         "test_plugins_local",         "local_plugins_local",
    "release_plugins_user",          "test_plugins_user",          "local_plugins_user"
  ], async function(local) {

    if (local.channel) channel = local.channel;
    if (local.local_server_host) network_host['local'] = "http://" + local.local_server_host;

    let update_check_interval = local[channel+'_update_check_interval']*60*60;
    if (!update_check_interval) update_check_interval = 24*60*60;
    if (channel === 'local') update_check_interval = 5; // check every 5 seconds

    if (retry === undefined) {
      clearTimeout(update_timeout_id); update_timeout_id = null;
      retry = 0;
    }

    if (local[channel+'_last_modified'] === undefined || local.last_check_update === undefined) {
      clearTimeout(update_timeout_id); update_timeout_id = null;
      await downloadMeta(local, null);
    } else {
      let time_delta = Math.floor(Date.now() / 1000)-update_check_interval-local.last_check_update;
      if (time_delta >= 0 || force) {
        clearTimeout(update_timeout_id); update_timeout_id = null;
        let last_modified = await ajaxGetWithProgress(network_host[channel]+"/meta.json", "Last-Modified");
        if (last_modified) {
          if (last_modified !== local[channel+'_last_modified'] || force) {
            await downloadMeta(local, last_modified);
          }
        } else {
          retry += 1;
          let seconds = retry*retry;
          if (seconds > 60*60*24) seconds = 60*60*24;
          chrome.runtime.sendMessage({'type': "showMessage", 'message': _('serverNotAvailableRetry', seconds.toString())});
          update_timeout_id = setTimeout(function(){
            checkUpdates(true, retry);
          }, seconds*1000);
        }
      }
    }

    if (!update_timeout_id) {
      await save({
        'last_check_update': Math.floor(Date.now() / 1000)
      });

      update_timeout_id = setTimeout(function () {
        checkUpdates();
      }, update_check_interval * 1000);
    }
  });
}

async function downloadMeta(local, last_modified) {
  let response = await ajaxGetWithProgress(network_host[channel]+"/meta.json", "parseJSON");
  if (!response) return;

  let plugins_flat = getPluginsFlat(response);
  let categories = getCategories(response);
  let plugins_local = local[channel+'_plugins_local'];
  let plugins_user = local[channel+'_plugins_user'];

  let p_iitc = new Promise(async () => {
    let iitc_code = await ajaxGetWithProgress(network_host[channel]+"/total-conversion-build.user.js");
    if (iitc_code) {
      await save({
        'iitc_code': iitc_code
      })
    }
  });

  let p_plugins = new Promise(async () => {
    plugins_local = await updateLocalPlugins(plugins_flat, plugins_local);

    plugins_flat = rebuildingArrayCategoriesPlugins(categories, plugins_flat, plugins_local, plugins_user);
    await save({
      'iitc_version': response['iitc_version'],
      'last_modified': last_modified,
      'categories': categories,
      'plugins_flat': plugins_flat,
      'plugins_local': plugins_local,
      'plugins_user': plugins_user
    });
  });

  await Promise.all([p_iitc, p_plugins]);
}

function getCategories(data) {
  if (!('categories' in data)) return {};
  let categories = data['categories'];

  Object.keys(categories).forEach(function (cat) {
    if ('plugins' in categories[cat]) {
      delete categories[cat]['plugins'];
    }
  })

  return categories;
}

function getPluginsFlat(data) {
  if (!('categories' in data)) return {};
  let plugins = {};
  let categories = data['categories'];

  Object.keys(categories).forEach(function (cat) {
    if ('plugins' in categories[cat]) {
      Object.keys(categories[cat]['plugins']).forEach(function (id) {
        let plugin = categories[cat]['plugins'][id];
        plugin['uid'] = getUID(plugin)
        plugin['status'] = 'off';
        plugin['category'] = cat;
        plugins[plugin['uid']] = plugin;
      });
    }
  })
  return plugins;
}

function checkExternalUpdates(force) {
  chrome.storage.local.get([
    "channel",
    "last_check_external_update",
    "external_update_check_interval",
    "release_plugins_user",          "test_plugins_user",          "local_plugins_user"
  ], async function(local){

    if (local.channel) channel = local.channel;

    let update_check_interval = local['external_update_check_interval']*60*60;
    if (!update_check_interval) {
      update_check_interval = 24*60*60;
    }

    let time_delta = Math.floor(Date.now() / 1000)-update_check_interval-local.last_check_external_update;
    if (time_delta >= 0 || force) {
      clearTimeout(external_update_timeout_id); external_update_timeout_id = null;
      await updateExternalPlugins(local);
    }

    if (!external_update_timeout_id) {
      await save({
        'last_check_external_update': Math.floor(Date.now() / 1000)
      });

      clearTimeout(external_update_timeout_id); external_update_timeout_id = null;
      external_update_timeout_id = setTimeout(function () {
        checkUpdates();
      }, update_check_interval * 1000);
    }
  });
}

async function updateExternalPlugins(local) {
  let plugins_user = local[channel+'_plugins_user'];
  if (plugins_user) {
    let exist_updates = false;
    let hash = "?"+Date.now();

    let promises = Object.keys(plugins_user).map(async function(uid) {
      let plugin = plugins_user[uid];

      if (plugin['updateURL'] && plugin['downloadURL']) {

        // download meta info
        let response_meta = await ajaxGetWithProgress(plugin['updateURL']+hash);
        if (response_meta) {
          let meta = parse_meta(response_meta);
          // if new version
          if (meta && meta['version'] && meta['version'] !== plugin['version']) {
            // download userscript
            let response_code = await ajaxGetWithProgress(plugin['updateURL']+hash);
            if (response_code) {
              exist_updates = true;
              plugins_user[uid] = meta;
              plugins_user[uid]['code'] = response_code;
            }
          }
        }
      }
    });

    await Promise.all(promises);
    if (exist_updates) {
      await save({
        'plugins_user': plugins_user
      })
    }
  }
}

async function updateLocalPlugins(plugins_flat, plugins_local) {
  // If no plugins installed
  if (plugins_local === undefined) return {};

  // Iteration local plugins
  let promises = Object.keys(plugins_local).map(async function(uid) {
    let filename = plugins_local[uid]['filename'];

    if (filename) {
      let code = await ajaxGetWithProgress(network_host[channel]+"/plugins/" + filename);
      if (code) plugins_local[uid]['code'] = code;
    } else {
      delete plugins_local[uid];
    }
  });
  await Promise.all(promises);
  return plugins_local;
}

function managePlugin(uid, category, action) {
  chrome.storage.local.get([channel+"_plugins_flat", channel+"_plugins_local", channel+"_plugins_user"], async function(local) {
    let plugins_flat = local[channel+'_plugins_flat'];
    let plugins_local = local[channel+'_plugins_local'];
    let plugins_user = local[channel+'_plugins_user'];

    if (plugins_local === undefined) plugins_local = {};
    if (plugins_user === undefined) plugins_user = {};

    if (action === 'on') {

      if (plugins_flat[uid]['user'] === false && plugins_local[uid] !== undefined ||
          plugins_flat[uid]['user'] === true) {

        plugins_flat[uid]['status'] = 'on';
        if (plugins_flat[uid]['user']) {
          plugins_user[uid]['status'] = 'on';
        } else {
          plugins_local[uid]['status'] = 'on';
        }

        injectUserScript(preparationUserScript(
            (plugins_flat[uid]['user'] === true) ? plugins_user[uid] : plugins_local[uid],
            uid
        ));

        await save({
          'plugins_flat': plugins_flat,
          'plugins_local': plugins_local,
          'plugins_user': plugins_user
        })

      } else {
        let filename = plugins_flat[uid]['filename'];
        let response = await ajaxGetWithProgress(network_host[channel]+"/plugins/"+filename);
        if (response) {
          plugins_flat[uid]['status'] = 'on';
          plugins_local[uid] = plugins_flat[uid];
          plugins_local[uid]['code'] = response;

          injectUserScript(preparationUserScript(plugins_local[uid], uid));

          await save({
            'plugins_flat': plugins_flat,
            'plugins_local': plugins_local
          })
        }
      }

    }
    if (action === 'off') {

      plugins_flat[uid]['status'] = 'off';
      if (plugins_flat[uid]['user']) {
        plugins_user[uid]['status'] = 'off';
      } else {
        plugins_local[uid]['status'] = 'off';
      }

      await save({
        'plugins_flat': plugins_flat,
        'plugins_local': plugins_local,
        'plugins_user': plugins_user
      })

    }
    if (action === 'delete') {

      if (plugins_flat[uid]['override']) {
        plugins_flat[uid]['override'] = false;
        plugins_flat[uid]['user'] = false;
        plugins_flat[uid]['status'] = "off";
      } else {
        delete plugins_flat[uid];
      }
      delete plugins_user[uid];

      await save({
        'plugins_flat': plugins_flat,
        'plugins_local': plugins_local,
        'plugins_user': plugins_user
      })
    }
  });
}

function addUserScripts(scripts) {
  chrome.storage.local.get([channel+"_categories", channel+"_plugins_flat", channel+"_plugins_local", channel+"_plugins_user"], async function(local) {
    let categories = local[channel + '_categories'];
    let plugins_flat = local[channel + '_plugins_flat'];
    let plugins_local = local[channel + '_plugins_local'];
    let plugins_user = local[channel + '_plugins_user'];

    if (plugins_local === undefined) plugins_local = {};
    if (plugins_user === undefined) plugins_user = {};

    scripts.forEach(function(script) {
      let meta = script['meta'];
      let code = script['code'];
      let plugin_uid = getUID(meta);

      plugins_user[plugin_uid] = meta;
      plugins_user[plugin_uid]['uid'] = plugin_uid;
      plugins_user[plugin_uid]['status'] = 'on';
      plugins_user[plugin_uid]['code'] = code;

      if (plugin_uid in plugins_flat) {
        if (plugins_flat[plugin_uid]['status'] !== 'off') {
          plugins_local[plugin_uid]['status'] = "off";
        }

        plugins_flat[plugin_uid]['status'] = plugins_user[plugin_uid]['status'];
        plugins_flat[plugin_uid]['code'] = plugins_user[plugin_uid]['code'];
        plugins_flat[plugin_uid]['override'] = true;
      } else {
        plugins_flat[plugin_uid] = plugins_user[plugin_uid];

        let category = plugins_user[plugin_uid]["category"];
        if (category === undefined)
          category = "Misc";
        if (!(category in plugins_flat)) {
          categories[category] = {
            'name': category,
            'description': ''
          };
        }
      }
      plugins_flat[plugin_uid]['user'] = true;
    });

    await save({
      'categories': categories,
      'plugins_flat': plugins_flat,
      'plugins_local': plugins_local,
      'plugins_user': plugins_user
    })
  });
}

function rebuildingArrayCategoriesPlugins(categories, raw_plugins, plugins_local, plugins_user) {
  let data = {};
  if (plugins_local === undefined) plugins_local = {};
  if (plugins_user === undefined) plugins_user = {};

  if (raw_plugins["Obsolete"] !== undefined) delete raw_plugins["Obsolete"];
  if (raw_plugins["Deleted"] !== undefined) delete raw_plugins["Deleted"];
  data = {...raw_plugins};

  // Build local plugins
  Object.keys(plugins_local).forEach(function (plugin_uid) {
    data[plugin_uid]['status'] = plugins_local[plugin_uid]['status'];
  });

  // Build External plugins
  if (Object.keys(plugins_user).length) {
    Object.keys(plugins_user).forEach(function (plugin_uid) {
      if (plugin_uid in data) {
        data[plugin_uid]['status'] = plugins_user[plugin_uid]['status'];
        data[plugin_uid]['code'] = plugins_user[plugin_uid]['code'];
        data[plugin_uid]['override'] = true;
      } else {
        data[plugin_uid] = plugins_user[plugin_uid];

        let userscript_category = plugins_user[plugin_uid]["category"];
        if (userscript_category === undefined)
          userscript_category = "Misc";

        if (!(userscript_category in data)) {
          categories[userscript_category] = {
            'name': userscript_category,
            'description': '',
          };
        }
      }
      data[plugin_uid]['user'] = true;
    });
  }

  return data;
}
