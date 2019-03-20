let ractive = new Ractive({
  target: '#target-ractive',
  template: '#template-ractive',
  data: {
    'categories': {},
    'plugins': {},
    'category_name': ''
  }
});

ractive.on({
  'openIITC': function (event) {
    event.original.preventDefault();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.runtime.sendMessage({'type': "requestOpenIntel", 'tab': tabs[0].id});
      window.close();
    })
  },
  'toggleIITC': function (event) {
    var checkedValue = document.querySelector('#toggleIITC').checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.runtime.sendMessage({'type': "toggleIITC", 'value': checkedValue});
    })
  },
  'open-link': function (event) {
    chrome.tabs.create({
      url: event.node.getAttribute( 'data-href' )
    });
    window.close();
  },
  'back': function (event) {
    document.body.id = "main-menu";
  },
  'open-options': function (event) {
    document.body.id = "options";
  },
  'open-category': function (event) {
    document.body.id = "plugins";
    let category_name = event.node.getElementsByTagName("span")[0].innerHTML;
    ractive.set('category_name', category_name);

    let plugins = ractive.get('categories')[category_name]['plugins'];
    ractive.set('plugins', plugins);
  },
  'test-progress': function (event) {
      let element = document.getElementById("progressbar");
      if (!(element.classList.contains("active"))) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
  }
});

chrome.runtime.onMessage.addListener(function(request) {
  console.log(request);
  switch (request.type) {
    case "showProgressbar":
      let element = document.getElementById("progressbar");
      if (request.value) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
      break;
    default:
      console.log("undefined message");
  }
});


chrome.storage.local.get(["IITC-is-enabled", "release_plugins"], function(data) {
  // initialize categories
  let categories = data.release_plugins;
  const ordered_categories = {};
  Object.keys(categories).sort().forEach(function(key) {
    if (!["Obsolete", "Deleted"].includes(key)) {
      ordered_categories[key] = categories[key];
    }
  });
  // if ('Misc' in categories) {
  //   ordered_categories['Misc'] = categories['Misc'];
  // }

  ractive.set('categories', ordered_categories);

  // initialize toggleIITC
  let status = data['IITC-is-enabled'];
  if (status === false) {
    document.querySelector('#toggleIITC').checked = false
  }
});



chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});



// 'use strict';
//
// var buildListView = (list) => {
//   let result ='';
//
//   list.reduce((prev, current, index, arr) => {
//   let [key, value] = current;
//   let localStoragePluginValue = localStorage[`plugin/${key}`];
//   // console.log(key, value, localStorage['plugin/'+key])
//   if (localStoragePluginValue !== undefined) value = localStoragePluginValue === 'true';
//   let res = `<li class="list-group-item">${key}
//       <div class="pull-right">
//         <input type="checkbox" data-plugin-name="${key}" name="plugin-checkbox" ${value ? 'checked="checked"': ''} >
//       </div>
//       </li>`;
//   result += res;
//   }, result);
//
//   $('.list-group').html('').append(result);
// };
//
// pluginHelpers.getPluginList(null, buildListView);
// pluginHelpers.setupButtons();
// pluginHelpers.listenFormChanges();
/*
Example 
 */
// $('[data-plugin-name="map.yandex"]').attr('checked', JSON.parse(localStorage['plugin/map.yandex']));
/* END */
