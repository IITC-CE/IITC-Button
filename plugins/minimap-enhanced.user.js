// ==UserScript==
// @id             iitc-plugin-minimap@breunigs,hansolo669
// @name           IITC plugin: Mini map
// @category       Controls
// @version        0.1.2
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://iitc.reallyawesomedomain.com/minimap-enhanced.user.js
// @downloadURL    https://iitc.reallyawesomedomain.com/minimap-enhanced.user.js
// @description    [jonatkins-2015-09-17-154202] Show a mini map on the corner of the map.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'jonatkins';
plugin_info.dateTimeVersion = '20150917.154202';
plugin_info.pluginId = 'minimap';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.miniMap = function() {};

window.plugin.miniMap.setup  = function() {
  try { console.log('Loading leaflet.draw JS now'); } catch(e) {}
  L.Control.MiniMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: false,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150
	},

	hideText: 'Hide MiniMap',

	showText: 'Show MiniMap',

	//layer is the map layer to be shown in the minimap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		this._layer = layer;
	},

	onAdd: function (map) {

		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


		this._miniMap = new L.Map(this._container,
		{
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
			crs: map.options.crs
		});

		this._miniMap.addLayer(this._layer);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
		this._mainMapMoving = false;
		this._miniMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._miniMap.whenReady(L.Util.bind(function () {
			this._aimingRect = L.rectangle(this._mainMap.getBounds(), {color: "#ff7800", weight: 1, clickable: false}).addTo(this._miniMap);
			this._shadowRect = L.rectangle(this._mainMap.getBounds(), {color: "#000000", weight: 1, clickable: false,opacity:0,fillOpacity:0}).addTo(this._miniMap);
			this._mainMap.on('moveend', this._onMainMapMoved, this);
			this._mainMap.on('move', this._onMainMapMoving, this);
			this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
			this._miniMap.on('move', this._onMiniMapMoving, this);
			this._miniMap.on('moveend', this._onMiniMapMoved, this);
		}, this));

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
		this._setDisplay(this._decideMinimized());
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._miniMap.off('moveend', this._onMiniMapMoved, this);

		this._miniMap.removeLayer(this._layer);
	},

   changeLayer: function (layer) {
	this._miniMap.removeLayer(this._layer);
	this._layer = layer;
	this._miniMap.addLayer(this._layer);
  },

	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', this.hideText, 'leaflet-control-minimap-toggle-display', this._container, this._toggleDisplayButtonClicked, this) : undefined;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize != this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the minimap
		if (this.options.toggleDisplay) {
			this._container.style.width = '19px';
			this._container.style.height = '19px';
			this._toggleDisplayButton.className += ' minimized';
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
		}
		else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._miniMapMoving) {
			this._mainMapMoving = true;
			this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._miniMapMoving = false;
		}
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMiniMapMoveStarted:function (e) {
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw:sw,ne:ne};
	},

	_onMiniMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
			this._shadowRect.setStyle({opacity:1,fillOpacity:0.3});
		}
	},

	_onMiniMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._miniMapMoving = true;
			this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity:0,fillOpacity:0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_decideZoom: function (fromMaintoMini) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoMini)
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			else
				return this._miniMap.getZoom() - this.options.zoomLevelOffset;
		} else {
			if (fromMaintoMini)
				return this.options.zoomLevelFixed;
			else
				return this._mainMap.getZoom();
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	}
});

L.Map.mergeOptions({
	miniMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.miniMapControl) {
		this.miniMapControl = (new L.Control.MiniMap()).addTo(this);
	}
});

L.control.minimap = function (options) {
	return new L.Control.MiniMap(options);
};

  try { console.log('done loading leaflet.draw JS'); } catch(e) {}

  function miniBaseLayer(layerNameFn) {
    // we can't use the same TileLayer as the main map uses - it causes issues.
    // but we can use whatever layer we want ... lets match the users selection
    var baseLayers = {};
    var mbmap;

    //OpenStreetMap attribution - required by several of the layers
    osmAttribution = 'Map data © OpenStreetMap contributors';

    // cartodb has some nice tiles too - both dark and light subtle maps - http://cartodb.com/basemaps/
    // (not available over https though - not on the right domain name anyway)
    var cartoAttr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    var cartoUrl = 'http://{s}.basemaps.cartocdn.com/{theme}/{z}/{x}/{y}.png';
    baseLayers['CartoDB Dark Matter'] = L.tileLayer(cartoUrl,{attribution:cartoAttr,theme:'dark_all'});
    baseLayers['CartoDB Positron'] = L.tileLayer(cartoUrl,{attribution:cartoAttr,theme:'light_all'});


    // we'll include google maps too - in the ingress default style, and a few other standard ones
    // as the stock intel map already uses the googme maps API, we just hijack their inclusion of the javascript and API key :)
    var ingressGMapOptions = {
      backgroundColor: '#0e3d4e', //or #dddddd ? - that's the Google tile layer default
      styles: [
          { featureType:"all", elementType:"all",
            stylers: [{visibility:"on"}, {hue:"#131c1c"}, {saturation:"-50"}, {invert_lightness:true}] },
          { featureType:"water", elementType:"all",
            stylers: [{visibility:"on"}, {hue:"#005eff"}, {invert_lightness:true}] },
          { featureType:"poi", stylers:[{visibility:"off"}]},
          { featureType:"transit", elementType:"all", stylers:[{visibility:"off"}] }
        ]
    };
    baseLayers['Google Default Ingress Map'] = new L.Google('ROADMAP',{maxZoom:21, mapOptions:ingressGMapOptions});
    baseLayers['Google Roads'] = new L.Google('ROADMAP',{maxZoom:21});
    baseLayers['Google Satellite'] = new L.Google('SATELLITE',{maxZoom:21});
    baseLayers['Google Hybrid'] = new L.Google('HYBRID',{maxZoom:21});
    baseLayers['Google Terrain'] = new L.Google('TERRAIN',{maxZoom:15});

    for (i in window.layerChooser._layers) {
      var obj = window.layerChooser._layers[i];
      if (!obj.overlay) {
        if (obj.name === layerNameFn()) {
           mbmap = baseLayers[obj.name];
        }
      }
    }
    return mbmap;
  }

  setTimeout(function() {
    if(!isSmartphone()) {
      // desktop mode - bottom-left, so it doesn't clash with the sidebar
      window.plugin.miniMap.MINI_MAP = new L.Control.MiniMap(miniBaseLayer(function() { return localStorage['iitc-base-map']; }), {toggleDisplay: true, position: 'bottomleft'}).addTo(window.map);
    } else {
      // mobile mode - bottom-right - so it floats above the map copyright text
      window.plugin.miniMap.MINI_MAP = new L.Control.MiniMap(miniBaseLayer(function() { return localStorage['iitc-base-map']; }), {toggleDisplay: true, position: 'bottomright'}).addTo(window.map);
    }
    map.on('baselayerchange', function(info) {
      window.plugin.miniMap.MINI_MAP.changeLayer(miniBaseLayer(function() { return info.name; }));
    });
  }, 0);

  $('head').append('<style>.leaflet-control-minimap {\n    border:solid rgba(255, 255, 255, 0.7) 3px;\n    box-shadow: 0 1px 7px #999;\n    background: #f8f8f9;\n    -moz-border-radius: 8px;\n    -webkit-border-radius: 8px;\n    border-radius: 8px;\n}\n\n.leaflet-control-minimap a {\n    background-color: rgba(255, 255, 255, 0.75);\n    background-position: 1px 2px;\n    background-repeat: no-repeat;\n    display: block;\n    outline: none;\n    z-index: 99999;\n}\n\n.leaflet-control-minimap a.minimized {\n    background-position: 1px -18px;\n}\n\n.leaflet-control-minimap-toggle-display {\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAmCAYAAADJJcvsAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90BEAAINZFnlVUAAAGwSURBVEjH7dU/SyNBGAbwd11Zi8ueFhKyclbCSzgw+A+7A2fgipDmyvsA11grB4e9B8YvEPwYsgQhmbxidVi5IMSByHWzTBAOdquFZWwiHJKNu7HQIk858P4GhnlmAGaZKsYY2xizUGRmbtxiEATfut3uudb6Q8ZGC7mg4XB4OBgMvvq+fxmG4fIzZI2IznJBtVqNHMeBJEm2hRAXSqnlEbJKRBdSytVcULlc/lWv149d14UoiraEEJdKqV0i6kkp18bNzGcdXqVSOVJK/RNCnMRx/Nn3/T9pmhY77Kd4ntfknJNt2zAJeREyxpz2+/29l5CJkDGmSUQHUspc92g+A+FEtCGl7GTM3cxqO8u7jjWhIhYALI1qtAgANgB8BIAHy7L+5oJarZbJ8DUifmGMyULtf5YHROTjkCJQhIh1xtjtVO/RU2zbvqtWq3Lqh22ERGma7gghrpRSn6aCEPFno9HYLJVKwziO13u93nUYhtuFIEQ8Zow1Pc8bcM6/u66bRFFUabfbXa31Ti4IEX8zxo7++wQE5/yH4zgmSZL7IAjuXnV7tdb7nU5nZdbjN84jVmvCsn+YeNEAAAAASUVORK5CYII=);\n    border-radius: 4px 4px 4px 4px;\n    height: 19px;\n    width: 19px;\n    position: absolute;\n    bottom: 0;\n    right: 0; \n}\n</style>');
};

var setup =  window.plugin.miniMap.setup;

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
