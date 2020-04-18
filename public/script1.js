mapboxgl.accessToken = 'pk.eyJ1IjoiaGFmaXl5YW5kaSIsImEiOiJjamY5dmY1c2gwbXowMnFvZmJlYmVibGd0In0.djzLVWymjTzvRF6XSFM7uQ';
var filterGroup = document.getElementById('filter-group');

var map = new mapboxgl.Map({
  container: 'map', // you need this
  style: 'mapbox://styles/mapbox/dark-v9', // you also need this
  center: [-73.977725, 40.760219], // [long, lat] Different than leaflet, different than google maps, same as geojson!
  zoom: 11.5
});


var times = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23'
];

// var numbers = [
//   '20',//0
//   '30',//1
//   '40',//2
//   '50',//3
//   '60',//4
//   '70',//5
//   '80'//6
// ];


function filterBy(time) {
  //filter by time
  var filters = ['==', 'time', time];
  map.setFilter('allcircles', filters);
  document.getElementById('time').textContent = times[time] + ":00";
}

// function filterBy2(number) {
//   //filter by number
//   console.log(('number')/10);
//   var filters = ['==', 'number', number/10];
//   map.setFilter('topstreet', filters);
//   document.getElementById('number').textContent = numbers[number/10-2]+'+';
// }




// Source is where the data is coming from, layer is what you're going to do with it.
map.on('load', function() {

  d3.json('data.geojson', function(err, data) {
    if (err) throw err;

    //Create a time property value based on time
    data.features = data.features.map(function(d) {
      var time = d.properties.DATEF + " " + d.properties.TIME + ":00";
      var time1 = new Date(time).getHours();
      d.properties.time = (time1);
      // console.log(d.properties.time);
      return d;
    });


    // Add a GeoJSON source containing place coordinates and information.
    map.addSource("dataname", {
      "type": "geojson",
      "data": data
    });

    map.addSource("dataStreet", {
      "type": "geojson",
      "data": "data_topstreets.json"
    });

    overViewMapShow();

    //click overview button, show first map
    $("#overview").click(function() {
      location.reload();
    }); //overview button end

    $("#topinjuried").click(function() {
      $("#map-overlay").fadeOut();
      $("#map-overlay2").fadeOut();
      $("#streetview2").fadeOut();
      $("#map-overlay1").fadeIn();
      $("#streetview").fadeIn();
      map.setLayoutProperty('allcircles', 'visibility', 'none');
      map.setLayoutProperty('topstreet', 'visibility', 'none');
      map.setLayoutProperty('topinjuried-labels', 'visibility', 'visible');
      topinjuried();
    }); //topinjuried button end

    $("#topstreet").click(function() {
      $("#map-overlay1").fadeOut();
      $("#streetview").fadeOut();
      $("#map-overlay").fadeOut();
      $("#map-overlay2").fadeIn();
      $("#streetview2").fadeIn();
      map.setLayoutProperty('topinjuried', 'visibility', 'none');
      map.setLayoutProperty('topinjuried-labels', 'visibility', 'none');
      map.setLayoutProperty('allcircles', 'visibility', 'none');
      topstreet();
    }); //topstreet button end


  });
});




//first map show function
function overViewMapShow() {
  $("#map-overlay").fadeIn();
  map.addLayer({
    'id': 'allcircles',
    'type': 'circle',
    'source': 'dataname',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, 2,
        27, 40
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, '#ffeda0',
        10, '#e34a33'
      ],
      'circle-opacity': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, 0.5,
        3, 1
      ]
    }
  });

  //filter by time
  filterBy(0);

  document.getElementById('slider2').addEventListener('input', function(e) {
    var time = parseInt(e.target.value, 10);
    filterBy(time);

    //how many features shown in the layer
    var features = map.queryRenderedFeatures({
      layers: ['allcircles']
    });
    console.log(features.length);
      // $("#numberofcollions").html();
  });

  //mouse hover layer
  map.addLayer({
    'id': 'allcircles-hover',
    'type': 'circle',
    'source': 'dataname',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, 1.5,
        27, 40
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, '#ffeda0',
        10, '#e34a33'
      ],
      'circle-opacity': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, 0.5,
        3, 1
      ],
      'circle-stroke-color': '#FF6666',
      'circle-stroke-width': 4
    },
    'filter': ["==", "name", ""]
  });

  //mouse hover effect
  map.on("mousemove", "allcircles", function(e) {
    map.getCanvas().style.cursor = 'pointer';
    map.setFilter("allcircles-hover", ["==", "name", e.features[0].properties.name]);
    if (e.features[0].properties.NUMBER_OF_PERSONS_INJURED != 0) {
      $("#details1").html(e.features[0].properties.NUMBER_OF_PERSONS_INJURED + "  Injured");
    }
    if (e.features[0].properties.NUMBER_OF_PERSONS_KILLED != 0) {
      $("#details2").html(e.features[0].properties.NUMBER_OF_PERSONS_KILLED + "  Killed");
    }

    $("#details3").html("<br><p>Time: " + e.features[0].properties.DATEF + "</p><p>On Street Name: " + e.features[0].properties.ON_STREET_NAME + "</p><p>Cross Street Name: " +
      e.features[0].properties.CROSS_STREET_NAME + "</p><p>Off Street Name: " + e.features[0].properties.OFF_STREET_NAME+ '</p>');

  });

  // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "allcircles", function() {
    map.getCanvas().style.cursor = '';
    map.setFilter("allcircles-hover", ["==", "name", ""]);
    $("#details1").html("");
    $("#details2").html("");
    $("#details3").html("");
  });
}


//   topinjuried map show function
function topinjuried() {
  map.addLayer({
    'id': 'topinjuried',
    'type': 'circle',
    'source': 'dataname',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        7, 10,
        27, 40
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        7, '#ffeda0',
        27, '#e34a33'
      ],
      'circle-opacity': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        7, 0.4,
        27, 0.7
      ]
    },
    'filter': [">=", "NUMBER_OF_PERSONS_INJURED", 7]
  });

  map.addLayer({
    'id': 'topinjuried-hover',
    'type': 'circle',
    'source': 'dataname',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        0, 0,
        1, 0,
        2, 0,
        3, 0,
        4, 0,
        5,0,
        6,0,
        7, 10,
        27, 40
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        7, '#ffeda0',
        11, '#feb24c',
        27, '#e34a33'
      ],
      'circle-opacity': 1,
      'circle-stroke-color': '#FF6666',
      'circle-stroke-width': 4
    },
    'filter': ["==", "name", ""]
  });


  map.addLayer({
    'id': 'topinjuried-labels',
    'type': 'symbol',
    'source': 'dataname',
    'layout': {
      'text-field': ['concat', ['to-string', ['get', 'NUMBER_OF_PERSONS_INJURED']]],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': [
        'interpolate', ['linear'],
        ['get', 'NUMBER_OF_PERSONS_INJURED'],
        7, 12,
        28, 20
      ]
    },
    'paint': {
      'text-color': '#ffffff'
    },
    'filter': [">=", "NUMBER_OF_PERSONS_INJURED", 7]
  });

  //mouse hover effect
  map.on("mousemove", "topinjuried", function(e) {
    map.getCanvas().style.cursor = 'pointer';
    map.setFilter("topinjuried-hover", ["==", "name", e.features[0].properties.name]);
    $("#details4").html(e.features[0].properties.NUMBER_OF_PERSONS_INJURED + "  Injured");
    $("#details5").html(e.features[0].properties.NUMBER_OF_PERSONS_KILLED + "  Killed");
    $("#details6").html("<br><p>Time: " + e.features[0].properties.DATEF + "</p><p>On Street Name: " + e.features[0].properties.ON_STREET_NAME + "</p><p>Cross Street Name: " +
      e.features[0].properties.CROSS_STREET_NAME + "</p><p>Off Street Name: " + e.features[0].properties.OFF_STREET_NAME+ "</p><p>Dtails: " +e.features[0].properties.CONTRIBUTING_FACTOR_VEHICLE1+'</p>');


  });

  // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "topinjuried", function() {
    map.getCanvas().style.cursor = '';
    map.setFilter("topinjuried-hover", ["==", "name", ""]);
    $("#details4").html("");
    $("#details5").html("");
    $("#details6").html("");
  });


  //click show google street view
  map.on('click', 'topinjuried-hover', function(e) {
    console.log(e.features[0].geometry.coordinates[1]);
    $("#streetview").html('<iframe width="350" height="250" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/streetview?key=AIzaSyCfO-x1m39bSqszx42hs-UZKBG_pwoLP-0&location=' + e.features[0].geometry.coordinates[1] + ',' + e.features[0].geometry.coordinates[0] + '&heading=210&pitch=10&fov=35" allowfullscreen></iframe>');
  });
}

//topstreet show function
function topstreet() {
  map.addLayer({
    'id': 'topstreet',
    'type': 'circle',
    'source': 'dataStreet',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'number'],
        20, 2,
        90, 20
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'number'],
        20, '#ffeda0',
        90, '#e34a33'
      ],
      'circle-opacity': 0.7
    }
  });

  map.addLayer({
    'id': 'topstreet-hover',
    'type': 'circle',
    'source': 'dataStreet',
    'paint': {
      'circle-radius': [
        'interpolate', ['linear'],
        ['get', 'number'],
        20, 2,
        90, 20
      ],
      'circle-color': [
        'interpolate', ['linear'],
        ['get', 'number'],
        20, '#ffeda0',
        90, '#e34a33'
      ],
      'circle-opacity': 0.7,
      'circle-stroke-color': '#FF6666',
      'circle-stroke-width': 4
    },
    'filter': ["==", "name", ""]

  });

  //mouse hover effect
  map.on("mousemove", "topstreet", function(e) {
    map.getCanvas().style.cursor = 'pointer';
    map.setFilter("topstreet-hover", ["==", "name", e.features[0].properties.name]);

      $("#details7").html(e.features[0].properties.number + "  Collisions");
      $("#details8").html("<br><p>On Street Name: " + e.features[0].properties.ON_STREET_NAME + "</p><p>Cross Street Name: " +
      e.features[0].properties.CROSS_STREET_NAME + "</p><p>Off Street Name: " + e.features[0].properties.OFF_STREET_NAME+ '</p>');

  });

  // Reset the state-fills-hover layer's filter when the mouse leaves the layer.
  map.on("mouseleave", "topstreet", function() {
    map.getCanvas().style.cursor = '';
    map.setFilter("topstreet-hover", ["==", "name", ""]);
    $("#details7").html("");
    $("#details8").html("");
  });


  //click show google street view
  map.on('click', 'topstreet-hover', function(e) {
    console.log(e.features[0].geometry.coordinates[1]);
    $("#streetview2").html('<iframe width="350" height="250" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/streetview?key=AIzaSyCfO-x1m39bSqszx42hs-UZKBG_pwoLP-0&location=' + e.features[0].geometry.coordinates[1] + ',' + e.features[0].geometry.coordinates[0] + '&heading=210&pitch=10&fov=35" allowfullscreen></iframe>');
  });

}//function ends
