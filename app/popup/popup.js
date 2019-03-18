var categories = [
  {name: 'Portal Info', description: 'Enhanced information on the selected portal'},
  {name: 'Info', description: 'Display additional information'},
  {name: 'Keys', description: 'Manual key management'},
  {name: 'Controls', description: 'Map controls/widgets'},
  {name: 'Highlighter', description: 'Portal highlighters'},
  {name: 'Layer', description: 'Additional map layers'},
  {name: 'Map Tiles', description: 'Alternative map layers'},
  {name: 'Tweaks', description: 'Adjust IITC settings'},
  {name: 'Misc', description: 'Unclassified plugins'},
  {name: 'Obsolete', description: 'Plugins that are no longer recommended, due to being superceded by others or similar'}
];

var ractive = new Ractive({
  target: '#target-ractive',
  template: '#template-ractive',
  data: {categories: categories}
});

ractive.on('openIITC', function (event) {
  event.original.preventDefault();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.runtime.sendMessage({'type': "requestOpenIntel", 'tab': tabs[0].id});
  });
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
