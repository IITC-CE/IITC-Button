// ==UserScript==
// @id             iitc-plugin-publish-info
// @name           IITC plugin: Publish well-formed portal information
// @author         SmallSea
// @category       Debug
// @version        0.1.1.0
// @namespace      pInfo
// @updateURL      https://github.com/SmallSea/iitc-plugin/raw/master/debug-publish-info.user.js
// @downloadURL    https://github.com/SmallSea/iitc-plugin/raw/master/debug-publish-info.user.js
// @description    Publish well-formed portal information
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'jonatkins';
plugin_info.dateTimeVersion = '0.1.0.2';
plugin_info.pluginId = 'debug-publish-info';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.pInfo = function() {};

window.plugin.pInfo.setupCallback = function() {
    addHook('portalDetailsUpdated', window.plugin.pInfo.addLink);
}

window.plugin.pInfo.addLink = function(d) {
  $('.linkdetails').append('<aside><a onclick="window.plugin.pInfo.showPortalData(\''+window.selectedPortal+'\')" title="Display information of the portal">Publish Info</a></aside>');
}

window.plugin.pInfo.showPortalData = function(guid) {
  if (!window.portals[guid]) {
    console.warn ('Error: failed to find portal details for guid '+guid+' - failed to show debug data');
    return;
  }

  var data = window.portals[guid].options.data;
  var ts = window.portals[guid].options.timestamp;
  var title = 'Raw portal data: ' + (data.title || '<no title>');
  var details = portalDetail.get(guid);
  var mods = details.mods;
  var res = details.resonators;

  var modstring = [];
  var agentstring = [];
  for (var i = 0; i < mods.length; i++) {
    if (mods[i] == null) {
        continue;
    }
    var mod = ''
      switch (mods[i].rarity) {
          case "COMMON":
              mod = 'C';
              break;
          case "RARE":
              mod = 'R';
              break;
          case "VERY_RARE":
              mod = 'VR';
              break;
      }
      switch(mods[i].name) {
          case "Portal Shield":
              mod = mod + 'P';
              break;
          case "Heat Sink":
              mod = mod + 'HS';
              break;
          case "Multi-hack":
              mod = mod + 'MH';
              break;
          case "Force Amp":
              mod = 'FA';
              break;
          case "Turret":
              mod = 'T';
              break;
          case "Link Amp":
              mod = 'LA';
              break;
          case "AXA Shield":
              mod = 'AXA';
              break;
          case "SoftBank Ultra Link":
              mod = 'SULA';
              break;
    }
    modstring.push(mod);
    agentstring.push('@' + mods[i].owner);
  }

  for (var i = 0; i < res.length; i++) {
    if (res[i] == null) {
        continue;
    }
    agentstring.push('@' + res[i].owner);
  }

  function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{6})+(?!\d))/g, "$1.")
  }

  var ll = formatNumber(data.latE6) + ',' + formatNumber(data.lngE6);

  function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }

  var uniqueAgents = unique(agentstring);

  var frackerString = '';
  var ornaments = details.ornaments;

  for (var i = 0; i < ornaments.length; i++) {
    if (ornaments[i] == 'peFRACK') {
        frackerString = '( Notice: Portal fracker is frying NOW!!! ) <br />';
    }
  }

  var body =
    data.team + ' / L' + data.level + ' / ' + data.title + '<br />' + 
    frackerString +
    'MODs: ' + modstring.join("/") +'<br />' + 
    'Agents: ' + uniqueAgents.join(" ") +'<br />' + 
    'Intel: http://www.ingress.com/intel?ll=' + ll + '&pll=' + ll + '&z=17 <br />' +
    'gMap: http://maps.google.com/?q=' + ll;

  dialog({
    title: title,
    html: body,
    id: 'dialog-pInfo',
    dialogClass: 'ui-dialog-pInfo',
  });
}

var setup = function () {
  window.plugin.pInfo.setupCallback();
  $('head').append('<style>' +
      '.ui-dialog-pInfo {' +
        'width: auto !important;' +
        'min-width: 400px !important;' +
        //'max-width: 600px !important;' +
    '}' +
      '#dialog-pInfo {' +
        'overflow-x: auto;' +
        'overflow-y: auto;' +
    '}' +
    '</style>');
}


// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


