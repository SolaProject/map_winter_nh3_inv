import { evaluate_cmap_hex, is_cmap } from "../my_modules/js-colormap/js-colormaps";
import { Normalize, LogNorm } from "../my_modules/js-normalize/js-normalize";
import * as staInfo from "./data/site-total.json";
import * as point_source from "./data/point_source.json";
import * as point_source_correct from "./data/point_source_BHT_correct.json"
import * as country_bht from "./data/country_bht.json"

var cmap = "jet";
var reverse = false;
var vmin = 0;
var vmax = 20;
var opacity = 0.8;
var scale = "normal";
var normalize = new Normalize(vmin, vmax);

function update_style_config() {
  if (document.getElementById("vmin")) {
    vmin = Number(document.getElementById("vmin").value);
  };
  if (document.getElementById("vmax")) {
    vmax = Number(document.getElementById("vmax").value);
  };
  if (document.getElementById("opacity")) {
    opacity = Number(document.getElementById("opacity").value);
  };
  if (document.getElementById("cmap")) {
    cmap = document.getElementById("cmap").value;
    if (!(is_cmap(cmap))) {
      // alert('Colormap ' + cmap + 'does not exist! Set cmap to jet.');
      cmap = 'jet';
    }
  };
  if (document.getElementById("reverse")) {
    reverse = document.getElementById("reverse").checked;
  };
  if (document.getElementsByName("scale")) {
    var obj = document.getElementsByName("scale");
    for (var i=0;i<obj.length;i++) {
      if (obj[i].checked) {
        scale = obj[i].value;
      }
    }
  };
  if (scale == 'normal') {
    normalize = new Normalize(vmin, vmax);
  } else if (scale == 'log') {
    normalize = new LogNorm(vmin, vmax);
  }
  return normalize, cmap, opacity, reverse;
}

function vectorTileLayerStyles(properties) {
  // normalize, cmap, opacity, reverse = get_style_config();
  return {
    fill: true,
    fillColor: evaluate_cmap_hex(
      normalize.cal(properties.data),
      cmap,
      reverse
    ),
    fillOpacity: opacity,
    stroke: false, //不显示网格边框线
    weight: 0,
  };
}

//加载基础图层
var ESRI = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

//pbf网格图层
var gridLayer_winter_nh3_inv = L.vectorGrid.protobuf(
  // 加载pbf文件
  "https://solaproject.github.io/mbtiles_winter_nh3_inv/winter_nh3_inv/{z}/{x}/{y}.pbf",
  {
    rendererFactory: L.canvas.tile,
    attribution: "© Sola",
    interactive: true,
    getFeatureId: function (feature) {
      return feature.properties.id;
    },
    vectorTileLayerStyles: {
      winter_nh3_inv: vectorTileLayerStyles,
    },
    maxNativeZoom: 11,
    maxZoom: 22,
    // minZoom: 5,
  }
);

var station = L.geoJSON(staInfo, {
  onEachFeature: function (feature, layer) {
    var index = String(feature.properties.index);
    var lon = feature.properties.longitude.toFixed(3);
    var lat = feature.properties.latitude.toFixed(3);
    layer.bindPopup(
      `
                <table>
                <tbody>
                <tr>
                <td><b>Station ID: </b></td>
                <td>${index}</td>
                </tr>
                <tr>
                <td><b>Longitude: </b></td>
                <td>${lon}</td>
                </tr>
                <td><b>Latitude: </b></td>
                <td>${lat}</td>
                </tr>
                </tbody>
                </table>
                `
    );
  },
});

var points = L.geoJSON(point_source, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#d54035",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    })
  },
  onEachFeature: function (feature, layer) {
    var index = String(feature.properties.index);
    var lon = feature.properties.longitude.toFixed(3);
    var lat = feature.properties.latitude.toFixed(3);
    var name = feature.properties.Name;
    var emission = feature.properties.Emission;
    if (emission != null) {
      emission = emission.toFixed(3);
    }
    layer.bindPopup(
      `
                <table>
                <tbody>
                <tr>
                <td><b>Source ID: </b></td>
                <td>${index}</td>
                </tr>
                <tr>
                <td><b>Name: </b></td>
                <td>${name}</td>
                </tr>
                <tr>
                <td><b>Longitude: </b></td>
                <td>${lon}</td>
                </tr>
                <td><b>Latitude: </b></td>
                <td>${lat}</td>
                </tr>
                </tr>
                <td><b>Emission: </b></td>
                <td>${emission}</td>
                </tr>
                </tbody>
                </table>
                `
    );
  },
});

var points_correct = L.geoJSON(point_source_correct, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#94c7c9",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    })
  },
  onEachFeature: function (feature, layer) {
    var index = String(feature.properties.index);
    var lon = feature.properties.longitude.toFixed(3);
    var lat = feature.properties.latitude.toFixed(3);
    var name = feature.properties.Name;
    var info = feature.properties.info;
    layer.bindPopup(
      `
                <table>
                <tbody>
                <tr>
                <td><b>Source ID: </b></td>
                <td>${index}</td>
                </tr>
                <tr>
                <td><b>Name: </b></td>
                <td>${name}</td>
                </tr>
                <tr>
                <td><b>Longitude: </b></td>
                <td>${lon}</td>
                </tr>
                <td><b>Latitude: </b></td>
                <td>${lat}</td>
                </tr>
                </tr>
                <td><b>Info: </b></td>
                <td>${info}</td>
                </tr>
                </tbody>
                </table>
                `
    );
  },
});

var countrys = L.geoJSON(country_bht, {
  onEachFeature: function (feature, layer) {
    layer.bindPopup(
      `
      ${feature.properties.PAC}, ${feature.properties.NAME}
      `
    )
  }
})

var osm_map = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
});

var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxNativeZoom}/{z}/{y}/{x}.{format}', {
	attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
  minZoom: 1,
  maxZoom: 22,
  maxNativeZoom: 8,
  format: 'jpg',
  time: '',
  tilematrixset: 'GoogleMapsCompatible_Level'
});

var gaode_map = L.tileLayer(
  "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
);

var stamen_terrain = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png?api_key=3d191c7d-2281-44e1-bf79-352a0ca9f9c1",
  {
    attribution:
      "Map tiles by <a href='http://stamen.com/'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/4.0'>CC BY 4.0</a>. Data by <a href='http://openstreetmap.org/'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.",
  }
);

var Tianditu_map = L.tileLayer.chinaProvider("TianDiTu.Normal.Map");

var gaode_map = L.tileLayer.chinaProvider("GaoDe.Normal.Map");

var google_map = L.tileLayer.chinaProvider("Google.Normal.Map");

var tencent_map = L.tileLayer.chinaProvider("Tencent.Normal.Map");

const baseLayers = {
  "ESRI World Imagery": ESRI,
  OpenStreetMap: osm_map,
  StamenTerrain: stamen_terrain,
  高德地图: gaode_map,
  天地图: Tianditu_map,
  谷歌地图: google_map,
  夜间灯光: NASAGIBS_ViirsEarthAtNight2012,
};

const overlays = {
  winter_nh3_inv: gridLayer_winter_nh3_inv,
  地面站点: station,
  原始点源: points,
  修正点源: points_correct,
  京津冀区县: countrys,
};

//创建地图
const map = L.map("map", {
  center: [39, 117],
  zoom: 7,
  layers: [
    ESRI,
    gridLayer_winter_nh3_inv,
    station,
    points_correct,
  ],
});
//鼠标悬浮显示网格信息
var info = L.control();
info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};
info.update = function (props) {
  this._div.innerHTML =
    "<b>Data indicators</b>" +
    "<br />" +
    (props
      ? "氨气排放: " + props.data.toFixed(3) + "" + "<br />"
      : "鼠标悬停网格区域显示相关信息");
};
info.addTo(map);

var input = document.createElement("div");
input.innerHTML = `
    <table>
        <tbody>
        <tr>
            <td><b>vmin: </b></td>
            <td><input type="text" id="vmin" value=${String(
              vmin
            )} style="width:60px" /></td>
        </tr>
        <tr>
            <td><b>vmax: </b></td>
            <td><input type="text" id="vmax" value=${String(
              vmax
            )} style="width:60px" /></td>
        </tr>
        <tr>
            <td><b>opacity: </b></td>
            <td><input type="text" id="opacity" value=${String(
              opacity
            )} style="width:60px" /></td>
        </tr>
        <tr>
            <td><b>cmap: </b></td>
            <td><input type="text" id="cmap" value=${String(
              cmap
            )} style="width:60px" /></td>
        </tr>
        <tr>
            <td><b>scale: </b></td>
            <td>
              <input type="radio" name="scale" value="normal" checked="checked" style="width:10px" />linear
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
              <input type="radio" name="scale" value="log" style="width:10px" />log
            </td>
        </tr>
        <tr>
            <td><b>reverse: </b></td>
            <td><input type="checkbox" id="reverse" value=${String(
              reverse
            )} style="width:20px" /></td>
        </tr>
        </tbody>
    </table>
`;
var button = document.createElement("button");
button.innerHTML = "Refresh";
button.onclick = function () {
  update_layer()
};

function update_layer() {
  update_style_config()
  if (gridLayer_winter_nh3_inv._map) {
    gridLayer_am.removeFrom(map);
    gridLayer_am.addTo(map);
  };
  legend.update();
}

// 创建一个图层
var gridLayer_style_config = L.control();
gridLayer_style_config.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this._div.appendChild(input);
  this._div.appendChild(button);
  return this._div;
};
gridLayer_style_config.addTo(map);
// document.onkeydown = function (e) {
//   if (e.keyCode == '90') {
//     update_layer();
//   }
// }
var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

function highlightFeature(e) {
  //更新信息
  var props = e.layer.properties;
  info.update(props);
}
function resetHighlight(e) {
  //重置信息
  info.update();
}
gridLayer_winter_nh3_inv.on({
  mouseover: highlightFeature,
  mouseout: resetHighlight,
});

// station.on('click', function (e) { // this line and below
//     L.popup()
//         .setContent(`Id: ${e.layer.properties.index}`)
//         .setLatLng(e.latlng)
//         .openOn(map);
// });

var lonlat_info = L.control({ position: "bottomright" });
lonlat_info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  // this.update();
  return this._div;
};
lonlat_info.update = function (lon, lat) {
  this._div.innerHTML = `
    <table>
      <tbody>
        <tr>
          <td><b>Lon:</b></td>
          <td>${lon.toFixed(3)}</td>
        </tr>
        <tr>
          <td><b>Lat:</b></td>
          <td>${lat.toFixed(3)}</td>
        </tr>
      </tbody>
    </table>
    `;
};

lonlat_info.addTo(map);
function update_lonlat(e) {
  var lon = e.latlng.lng;
  var lat = e.latlng.lat;
  lonlat_info.update(lon, lat);
}
map.on({
  mousemove: update_lonlat,
});

//添加常见控件
L.control.scale({ maxWidth: 100, metric: true, imperial: false }).addTo(map); // 比例尺控件

//添加图例控件
var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info legend")
  this.update()
  return this._div;
};
legend.update = function () {
  this._div.innerHTML = '';
  // normalize, cmap, opacity, reverse = update_style_config();
  var n = 11;
  for (var i=0;i<n;i++) {
    var x = i/(n-1);
    var label = Math.round(normalize.inverse(x));
    var color = evaluate_cmap_hex(x, cmap, reverse)
    this._div.innerHTML +=
      '<i style="background:' +
      color +
      '"></i> ' +
      label +
      "<br>";
  }
};
legend.addTo(map);