'use strict';

var buildListView = (list) => {
  let result ='';
  
  list.reduce((prev, current, index, arr) => {
    let [key, value] = current;
    let localStoragePluginValue = localStorage[`plugin/${key}`];
    // console.log(key, value, localStorage['plugin/'+key])
    if (localStoragePluginValue !== undefined) value = localStoragePluginValue === 'true'; 
    let res = `<li class="list-group-item">${key}
            <div class="pull-right">
                <input type="checkbox" data-plugin-name="${key}" name="plugin-checkbox" ${value ? 'checked="checked"': ''} >
            </div>
          </li>`;
    result += res;
  }, result);

  $('.list-group').html('').append(result);
}; 

pluginHelpers.getPluginList(null, buildListView);
pluginHelpers.setupButtons();
pluginHelpers.listenFormChanges();
/*
Example 
 */
// $('[data-plugin-name="map.yandex"]').attr('checked', JSON.parse(localStorage['plugin/map.yandex']));
/* END */
