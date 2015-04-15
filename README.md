[![Build Status](https://travis-ci.org/elesdoar/leaflet-control-orderlayers.png?branch=master)](https://travis-ci.org/elesdoar/leaflet-control-orderlayers)

Leaflet Control Orderlayers
===========================

This plugin for leaflet provide support for order overlay layers and for change layers opacity in leaflet maps, for clone this code:

```
$ git clone https://github.com/elesdoar/leaflet-control-orderlayers.git
```
### Quick Use

#### Add javascript files:

```html
  <script src="[path to js]/leaflet-src.js"></script>
  <script src="[path to js]/leaflet.control.orderlayers.min.js"></script>
```

#### Add css files and map style:

```html
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="[path to css]/leaflet.control.orderlayers.css" />
  
  <style>
    html {
      height: 100%;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      vertical-align: baseline;
    }
    body, #container {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .map {
      height: 100%;
    }
  </style>
```

#### Add control:

```js
  <div id="map" class="map"></div>

  <script>
    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      opacity: 0.50,
      maxZoom: 19,
      detectRetina: true
    });

    var baseLayers = {
      '<i class="fa fa-globe"></i>OpenStreetMap_Mapnik': OpenStreetMap_Mapnik
    };

    var bogota =  L.tileLayer.wms("http://mapas.catastrobogota.gov.co/arcgiswsh/Mapa_Referencia/Mapa_referencia/MapServer/WMSServer", {
      layers: '8,7,6,5,4,2',
      format: 'image/png',
      opacity: 0.45,
      transparent: true,
      attribution: 'Catastro',
      crs: L.CRS.EPSG4326,
      version: '1.3.0'
    });

    var fire = L.tileLayer('http://openfiremap.org/hytiles/{z}/{x}/{y}.png', {
      attribution: 'OpenFireMap',
      continuousWorld: true
    });

    var Bogotacity = L.marker([4.598056, -74.075833]).bindPopup('Bogota'),
      Cota       = L.marker([4.809568, -74.098129]).bindPopup('Cota'),
      El_Dorado  = L.marker([4.702102, -74.147931]).bindPopup('El Dorado'),
      La_Calera  = L.marker([4.720689, -73.974716]).bindPopup('La Calera'),
      Soacha     = L.marker([4.583333, -74.216667]).bindPopup('Soacha');

    var cities = L.layerGroup([Bogotacity, Cota, El_Dorado, La_Calera, Soacha]);

    var overlayLayers = {
      '<i class="fa fa-fire"></i>OpenFireMap': fire,
      '<i class="fa fa-database"></i>Bogota': bogota,
      '<i class="fa fa-map-marker"></i>Cities': cities
    };

    var map = L.map('map', {
      center: [4.649, -74.086],
      zoom: 15,
      //default base layer
      layers: [OpenStreetMap_Mapnik],
      zoomControl: false
    });

    var controls = L.control.orderlayers(baseLayers, overlayLayers, {collapsed: false, title: '', opacity: true, increment: 0.1});
    controls.addTo(map);

    map.setView([4.649, -74.086], 11);

    bogota.addTo(map);
    cities.addTo(map);
    fire.addTo(map);

    var Foo        = L.marker([4.8, -74]).bindPopup('foo');
    Foo.addTo(map);

  </script>
```

### Options

+ **title:** Control title
+ **order:** Order for layers, 'normal': ascending z-index order, 'qgis': descending z-index order, it's like Qgis or ArcMap.
+ **opacity:** Allow opacity control (default: false)
+ **increment:** Opacity increment.

### Licence

MIT Licence
