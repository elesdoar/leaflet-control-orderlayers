/*
 * L.Control.OrderLayers is a control to allow users to switch between different layers on the map.
 */

L.Control.OrderLayers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		title: 'Administrador de Capas'
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this)
			.on('changeorder', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange)
		    .off('layerremove', this._onLayerChange)
			.off('changeorder', this._onLayerChange);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);
		
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		if(this.options.title) {
			var title = L.DomUtil.create('h3', className + '-title');
			title.innerHTML = this.options.title;
			form.appendChild(title);
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;
		
		var overlaysLayers = [];
		for (i in this._layers) {
			obj = this._layers[i];
			if(!obj.overlay) {
				this._addItem(obj);
			} else if(obj.layer.options.zIndex) {
				overlaysLayers[obj.layer.options.zIndex] = obj;
			}
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}
		
		for(i = 0; i < overlaysLayers.length; i++) {
			if(overlaysLayers[i]) {
				this._addItem(overlaysLayers[i]);
			}
		}
		
		L.DomUtil.create('div', 'clearfix', this._baseLayersList);
		L.DomUtil.create('div', 'clearfix', this._overlaysList);
		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var row = L.DomUtil.create('div', 'leaflet-row');
		
		var label = L.DomUtil.create('label', ''),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = L.DomUtil.create('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;
		
		var col = L.DomUtil.create('div', 'leaflet-input');
		col.appendChild(input);
		row.appendChild(col);
		col = L.DomUtil.create('div', 'leaflet-name');
		col.appendChild(label);
		row.appendChild(col);
		label.appendChild(name);
		
		var container;
		if(obj.overlay) {
			col = L.DomUtil.create('div', 'leaflet-up');
			L.DomEvent.on(col, 'click', this._onUpClick, this);
			col.layerId = input.layerId;
			row.appendChild(col);
			col = L.DomUtil.create('div', 'leaflet-down');
			col.layerId = input.layerId;
			L.DomEvent.on(col, 'click', this._onDownClick, this);
			row.appendChild(col);
			container = this._overlaysList; 
		} else {
			container = this._baseLayersList;
		}
		container.appendChild(row);
		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;
	},
	
	_onUpClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			if(auxLayer.overlay && (obj.layer.options.zIndex - 1) === auxLayer.layer.options.zIndex) {
				replaceLayer = auxLayer;
				break;
			}
		}
		
		var newZIndex = obj.layer.options.zIndex - 1;
		if(replaceLayer) {
			obj.layer.setZIndex(newZIndex);
			replaceLayer.layer.setZIndex(newZIndex + 1);
			this._map.fire('changeorder', obj, this);
		}
	},
	
	_onDownClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			if(auxLayer.overlay && (obj.layer.options.zIndex + 1) === auxLayer.layer.options.zIndex) {
				replaceLayer = auxLayer;
				break;
			}
		}
		
		var newZIndex = obj.layer.options.zIndex + 1;
		if(replaceLayer) {
			obj.layer.setZIndex(newZIndex);
			replaceLayer.layer.setZIndex(newZIndex - 1);
			this._map.fire('changeorder', obj, this);
		}
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	},
	
	hide: function() {
		this._container.style.display = 'none';
	},
	
	show: function() {
		this._container.style.display = '';
	}
});

L.control.orderlayers = function (baseLayers, overlays, options) {
	return new L.Control.OrderLayers(baseLayers, overlays, options);
};