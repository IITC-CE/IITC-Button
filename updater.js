checkUpdates();

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
  chrome.storage.local.get(["release_iitc_version", "release_plugins"], function(local){

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

function downloadMeta(local) {
  ajaxGet("https://iitc.modos189.ru/release.json", true, function (response) {
    chrome.storage.local.set({
      'release_iitc_version': response.release_iitc_version,
      'release_plugins': response.release_plugins
    });
    console.log('download total-conversion-build.user.js');
    ajaxGet("https://iitc.modos189.ru/build/release/total-conversion-build.user.js", false, function (response) {
      if (response) {
        chrome.storage.local.set({
          'release_iitc': response
        });
      }
    });
  });
}
