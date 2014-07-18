[![Build Status](https://travis-ci.org/elesdoar/leaflet-control-orderlayers.png?branch=master)](https://travis-ci.org/elesdoar/leaflet-control-orderlayers)

Leaflet Control Orderlayers
===========================

This plugin for leaflet provide support for order overlay layers in leaflet maps, for clone this code:

```
$ git clone https://github.com/elesdoar/leaflet-control-orderlayers.git
```
### Quick Use

#### Add javascript files:

```html
  <script src="[path to js]/leaflet-src.js"></script>
  <script src="[path to js]/leaflet.control.orderlayers.min.js"></script>
```

#### Add css files:

```html
  <link rel="stylesheet" href="[path to css]/leaflet.control.orderlayers.css" />
```

#### Add control:

```js
jQuery(function() {
  var map = L.map('map').setView([4.598056, -74.075833], 13);

  var b1 = L.tileLayer('http://a.tiles.mapbox.com/v3/[map-key]/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 20
  }).addTo(map);

  var b2 = L.tileLayer('http://a.tiles.mapbox.com/v3/[map-key]/{z}/{x}/{y}.png', {
      attribution: 'Map data © OpenStreetMap contributors, CC-BY-SA, Imagery © Mapbox',
      maxZoom: 20
  });

  var baseLayers = {
    'Streets': b1,
    'Night': b2,
  };

  var bogota =  L.tileLayer.wms("http://mapas.catastrobogota.gov.co/arcgiswsh/Mapa_Referencia/Mapa_referencia/MapServer/WMSServer", {
      layers: '8,7,6,5,4,2',
      format: 'image/png',
      opacity: 0.45,
      transparent: true,
      attribution: 'Catastro Bogotá http://catastrobogota.gov.co',
      crs: L.CRS.EPSG4326,
      version: '1.3.0'
  }).addTo(map);

  var fire = L.tileLayer('http://openfiremap.org/hytiles/{z}/{x}/{y}.png', {
      attribution: '© OpenFireMap contributors - © OpenStreetMap contributors',
    continuousWorld: true
  }).addTo(map);

  var overlayLayers = {
    'Bogotá': bogota,
    'OpenFireMap': fire
  };

  var controls = L.control.orderlayers(baseLayers, overlayLayers, {collapsed: false});
      controls.addTo(map);

  map.setView([4.649, -74.086], 11);
});
```

### Options

+ **title:** Control title
+ **order:** Order for layers, 'normal': ascending z-index order, 'qgis': descending z-index order, it's like Qgis or ArcMap.

### Licence

MIT Licence
