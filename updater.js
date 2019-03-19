checkUpdates();

let ajaxGet = function (url, parseJSON, callback) {
  var callback = (typeof callback == 'function' ? callback : false), xhr = null;
  xhr = new XMLHttpRequest();
  if (!xhr)
  return null;
  xhr.open("GET", url,true);
  xhr.onreadystatechange=function() {
    if (xhr.readyState === 4 && callback) {
      let response = xhr.responseText;
      if (parseJSON) {
        response = JSON.parse(response);
      }
      callback(response)
    }
  };
  xhr.send(null);
  return xhr;
};

function checkUpdates() {
  chrome.storage.local.get(["release_iitc_version", "release_plugins"], function(local){

    if (local.release_iitc_version === undefined) {
      console.log('needUpdate - first start');
      downloadMeta();
    } else {
      ajaxGet("https://iitc.modos189.ru/updates.json", true, function (response) {
        if (response && response.release !== local.release_iitc_version+'TODO') {
          console.log('needUpdate - new version');
          downloadMeta(local);
        }
      });
    }

  });
}

function downloadMeta(local) {
  console.log("local.release_iitc_version");
  console.log(local.release_iitc_version);
  ajaxGet("https://iitc.modos189.ru/release.json", true, function (response) {
    console.log("response.release_iitc_version");
    console.log(response.release_iitc_version);
    chrome.storage.local.set({
      'release_iitc_version': response.release_iitc_version,
      'release_plugins': response.release_plugins
    });
  });
}
