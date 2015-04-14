/*
 * L.Control.OrderLayers is a control to allow users to switch between different layers on the map
 * and to control layer opacity.
 */

L.Control.OrderLayers = L.Control.Layers.extend({
	options: {
		title: 'Layer Manager',
		order: 'normal',            // Values: ['normal', 'qgis']
		collapsed: 'true',
		increment: 0.1,
		showBaselayers: true
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		.on('layeradd', this._onLayerChange, this)
		.on('layerremove', this._onLayerChange, this)
		.on('changeorder', this._onLayerChange, this)
		.on('changeopacity', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		.off('layeradd', this._onLayerChange)
		.off('layerremove', this._onLayerChange)
		.off('changeorder', this._onLayerChange)
		.off('changeopacity', this._onLayerChange, this);
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers';
		var container = this._container = L.DomUtil.create('div', className);

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
			} else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		if (this.options.title) {
			var title = L.DomUtil.create('h3', className + '-title');
			title.innerHTML = this.options.title;
			form.appendChild(title);
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false;
		var overlaysPresent = false;
		var i, obj;

		var overlaysLayers = [];
		for (i in this._layers) {
			obj = this._layers[i];

			if (!obj.overlay) {
				this._addItem(obj);
			} else if (obj.layer.options && obj.layer.options.zIndex) {
				overlaysLayers[obj.layer.options.zIndex] = obj;
			} else if (obj.layer.getLayers && obj.layer.eachLayer) {
				var min = 9999999999;
				obj.layer.eachLayer(function(ly) {
					if (typeof ly.options.zIndex === 'undefined') {
						min = overlaysLayers.length;
						ly.options.zIndex = min;
						} else if (ly.options && ly.options.zIndex) {
							min = Math.min(ly.options.zIndex, min);
						}
					});
				overlaysLayers[min] = obj;
			}
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		var first, last;
		for (i = 0; i < overlaysLayers.length; i++) {
			if (overlaysLayers[i]) {
				if (typeof first === 'undefined') {
					first = i;
					last = first;
				}
				if (i > last) {
					last = i;
				}
			}
		}

		if (this.options.order === 'normal') {
			for (i = 0; i < overlaysLayers.length; i++) {
				if (overlaysLayers[i]) {
					this._addItem(overlaysLayers[i], i, first, last);
				}
			}
		} else {
			for (i = overlaysLayers.length-1; i >= 0; i--) {
				if (overlaysLayers[i]) {
					this._addItem(overlaysLayers[i], i, last, first);
				}
			}
		}
		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_addItem: function (obj, i, first, last) {
		var row = L.DomUtil.create('label', 'leaflet-row');

		var input;
		var checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = L.DomUtil.create('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);
		input.id = 'lf.'+ input.layerId;
		L.DomEvent.on(input, 'click', this._onInputClick, this);
		row.appendChild(input);

		var col;
		var opacity_value = this._getOpacity(obj).lyOp/this._getOpacity(obj).lyN;

		col = L.DomUtil.create('span', isNaN(opacity_value)? 'fa fa-ban fa-inverse fa-padding' : 'fa fa-minus-square-o fa-padding');
		col.title = isNaN(opacity_value)? '':'Lessen Layer Opacity';
		col.layerId = input.layerId;
		L.DomEvent.on(col, 'click', this._onLowerOpacityClick, this);
		row.appendChild(col);

		col = L.DomUtil.create('span', isNaN(opacity_value)? 'fa-inverse leaflet-opacity-value' : 'leaflet-opacity-value');
		col.innerHTML = isNaN(opacity_value)? '#.##' : opacity_value.toFixed(2);
		row.appendChild(col);

		col = L.DomUtil.create('span', isNaN(opacity_value)? 'fa fa-ban fa-inverse fa-padding' : 'fa fa-plus-square fa-padding');
		col.title = isNaN(opacity_value)? '':'Increase Layer Opacity';
		col.layerId = input.layerId;
		L.DomEvent.on(col, 'click', this._onHigherOpacityClick, this);
		row.appendChild(col);

		var container;
		if (obj.overlay) {
			col = L.DomUtil.create('span', (first === i)? 'fa fa-ban fa-inverse fa-padding' : 'fa fa-chevron-up fa-padding');
			col.title = (first === i)? '' : 'Move layer Up';
			col.layerId = input.layerId;
			L.DomEvent.on(col, 'click', (this.options.order === 'normal'? this._onUpClick : this._onDownClick), this);
			row.appendChild(col);

			col = L.DomUtil.create('span', (last === i)? 'fa fa-ban fa-inverse fa-padding' : 'fa fa-chevron-down fa-padding');
			col.title = (last === i)? '' : 'Move layer Down';
			col.layerId = input.layerId;
			L.DomEvent.on(col, 'click', (this.options.order === 'normal'? this._onDownClick : this._onUpClick), this);
			row.appendChild(col);

			container = this._overlaysList;
		} else {
			container = this._baseLayersList;
		}

		container.appendChild(row);

		var icon;
		icon = L.DomUtil.create('span', 'leaflet-icon');
		icon.htmlFor = input.id;
		icon.innerHTML = obj.name.replace(/(<.*>)?(.*)/g, '$1');
		row.appendChild(icon);

		var label;
		label = L.DomUtil.create('span', 'leaflet-name');
		label.htmlFor = input.id;
		label.innerHTML = obj.name.replace(/(<.*>)?(.*)/g, '$2');
		row.appendChild(label);

		return label;
	},

	_onHigherOpacityClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		var opacity_value = this._getOpacity(obj).lyOp/this._getOpacity(obj).lyN;
		var increment = this.options.increment;

		if (isNaN(opacity_value)) {
			return;
		}

		if (this._getOpacity(obj).lyN === 1 ) {
			obj.layer.setOpacity((opacity_value >= 1-increment)? 1 : opacity_value + increment);
		} else {
			obj.layer.eachLayer(function (layer) {
				layer.setOpacity((opacity_value >= 1-increment)? 1 : opacity_value + increment);
			});
		}
		this._map.fire('changeopacity', obj, this);
	},

	_onLowerOpacityClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		var opacity_value = this._getOpacity(obj).lyOp/this._getOpacity(obj).lyN;
		var increment = this.options.increment;

		if (isNaN(opacity_value)) {
			return;
		}

		if (this._getOpacity(obj).lyN === 1 ) {
			obj.layer.setOpacity((opacity_value <= 0+increment)? 0 : opacity_value - increment);
		} else {
			obj.layer.eachLayer(function (layer) {
				layer.setOpacity((opacity_value <= 0+increment)? 0 : opacity_value - increment);
			});
		}
		this._map.fire('changeopacity', obj, this);
	},

	_onUpClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];

		if (!obj.overlay) {
			return;
		}

		var replaceLayer = null;
		var idx = this._getZIndex(obj);
		for (var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			var auxIdx = this._getZIndex(auxLayer);
			if (auxLayer.overlay && (idx - 1) === auxIdx) {
				replaceLayer = auxLayer;
				break;
			}
		}

		var newZIndex = idx - 1;
		if (replaceLayer) {
			obj.layer.setZIndex(newZIndex);
			if ((typeof obj.layer.options != 'undefined' && typeof obj.layer.options.zIndex === 'undefined') 
				|| (typeof obj.layer.options === 'undefined')) {
				obj.layer.eachLayer(function(ly) {
					ly.options.zIndex = newZIndex;
				});
			}

			replaceLayer.layer.setZIndex(newZIndex + 1);
			if ((typeof replaceLayer.layer.options != 'undefined' && typeof replaceLayer.layer.options.zIndex === 'undefined') 
				|| (typeof replaceLayer.layer.options === 'undefined')) {
				replaceLayer.layer.eachLayer(function(ly) {
					ly.options.zIndex = newZIndex + 1;
				});
			}

			this._map.fire('changeorder', obj, this);
		}
	},

	_onDownClick: function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];

		if (!obj.overlay) {
			return;
		}

		var replaceLayer = null;
		var idx = this._getZIndex(obj);
		for (var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			var auxIdx = this._getZIndex(auxLayer);
			if (auxLayer.overlay && (idx + 1) === auxIdx) {
				replaceLayer = auxLayer;
				break;
			}
		}

		var newZIndex = idx + 1;
		if (replaceLayer) {
			obj.layer.setZIndex(newZIndex);
			if ((typeof obj.layer.options != 'undefined' && typeof obj.layer.options.zIndex === 'undefined') 
			|| (typeof obj.layer.options === 'undefined')) {
				obj.layer.eachLayer(function(ly) {
					ly.options.zIndex = newZIndex;
				});
			}

			replaceLayer.layer.setZIndex(newZIndex - 1);
			if ((typeof replaceLayer.layer.options != 'undefined' && typeof replaceLayer.layer.options.zIndex === 'undefined') 
			|| (typeof replaceLayer.layer.options === 'undefined')) {
				replaceLayer.layer.eachLayer(function(ly) {
					ly.options.zIndex = newZIndex - 1;
				});
			}

			this._map.fire('changeorder', obj, this);
		}
	},

	_getZIndex: function(ly) {
		var zindex = 9999999999;
		if (ly.layer.options && ly.layer.options.zIndex) {
			zindex = ly.layer.options.zIndex;
		} else if (ly.layer.getLayers && ly.layer.eachLayer) {
			ly.layer.eachLayer(function(lay) {
				if (lay.options && lay.options.zIndex) {
					zindex = Math.min(lay.options.zIndex, zindex);
				}
			});
		}
		return zindex;
	},

	_getOpacity: function(obj) {
		var lyOp = 0;
		var lyN = 0;

		if (typeof obj.layer.options === 'undefined') {
			obj.layer.eachLayer(function (layer) {
				lyOp += layer.options.opacity;
				++lyN;
			});
		} else {
			lyOp = obj.layer.options.opacity;
			lyN = 1;
		}
		return {
			lyOp: lyOp,
			lyN: lyN
		};
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
