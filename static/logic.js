
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var linkPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
// Perform a GET request to the query URL
d3.json(link, function(data) {
  d3.json(linkPlates, function(moreData) {
    createFeatures(data.features, moreData.features);
  })
  // Once we get a response, send the data.features object to the createFeatures function
});

function selectColor(bubble) {
  if (bubble > 5) {
    color = "#bd0026";
  }
  else if (bubble > 4) {
    color = "#f03b20"
  }
  else if (bubble > 3) {
    color = "#fd8d3c"
  }
  else if (bubble > 2) {
    color = "#ffffb2"
  }
  else if (bubble > 1) {
    color = "#c2e699"
  }
  else if (bubble > 0) {
    color = "#78c679"
  }
  else {
    color = "#238443"
  }
  return color;
}

function createFeatures(earthquakeData, tectonicPlates) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3>" + "<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  };


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {  
      var geojsonMarkerOptions = {
        fillOpacity: 0.9,
        color: "black",
        weight: 1,
        fillColor: selectColor(feature.properties.mag),
        radius: feature.properties.mag * 7
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  var plates = L.geoJSON(tectonicPlates, {
    color: "orange",
    weight: 4,
    fillColor: "transparent"
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Plates: plates,
    Earthquakes: earthquakes 
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, plates, earthquakes]
  });

  var legend = L.control({position: "bottomright"});
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + selectColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
