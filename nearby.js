var script = $('<script>')
  .attr('src', "https://maps.googleapis.com/maps/api/js?key=" + googleKey + "&libraries=places&callback=initMap")
  .attr('async','').attr('defer','');
script.appendTo($('body'));

var infoWindow = null;
var searchResults = [];
// var resultsLoaded = null;
var myPosition = null;
var lowestRating = 4;
var directionsDisplay;
var directionsService;
var map;

function initMap() {

  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true,  preserveViewport: true});
  directionsService = new google.maps.DirectionsService();

  var van = {lat: 49.2812136, lng: -123.120368};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: van,
    streetViewControl: false,
    mapTypeControl: false
  });
  
  directionsDisplay.setMap(map);

  infoWindow = new google.maps.InfoWindow({content: "Holding..."});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      myPosition = pos;

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: 'http://labs.google.com/ridefinder/images/mm_20_blue.png'
      });

      var request = {
        location: pos,
        radius: '400',
        types: ['restaurant']
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
  }

  function showDirections(place) {
    // console.log(this);
    index = this.dataset.index;
    // console.log(searchResults[index].position);
    google.maps.event.trigger(searchResults[index], 'click');
  }

  function calcRoute(dest) {
    var request = {
      origin: myPosition,
      destination: dest,
      travelMode: google.maps.TravelMode.WALKING
    };
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });
  }

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

      // Filter - only keep ratings above lowestRating (default: 4)
      results = results.filter(function(result){
        return result.rating > lowestRating;
      });

      // for each place in result, create an <a> tag and a marker.
      results.forEach(function(place, i){
        var element = document.createElement("a");
        element.setAttribute('href', '#');
        element.setAttribute('data-index', i);
        element.addEventListener("click", showDirections);
        var node = document.createTextNode(place.name);
        element.appendChild(node);
        document.getElementById('list').appendChild(element);
        createMarker(place);
      });
      
      // var event = document.createEvent('Event');
      // event.initEvent('load', true, true);
      // document.getElementById('map').dispatchEvent(event);

    }
  }

  function createMarker (place) {
    var marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      rating: place.rating,
      icon: 'http://maps.google.com/mapfiles/ms/icons/restaurant.png',
      address: place.vicinity
    });

    searchResults.push(marker);
    google.maps.event.addListener(marker, 'click', function(){
      windowContent = "<h3>"+this.title+"</h3>"+"<p>"+"Rating: "+"<strong>"+this.rating+"</strong>"+" / 5"+"</p>";
      calcRoute(this.position);
      infoWindow.setContent(windowContent);
      infoWindow.open(map, this);
    });
  }
}



$(function(){

  // var $list = $('#list');

  // $('#map').on('load', function(){

  //   searchResults.forEach(function(result){
  //     $('<a>').addClass('list-group-item').attr('href', '#').attr('data-id', result.id).text(result.name).appendTo($list);
  //   });

  // });

  // $list.on('click', 'a', function(){
  //   console.log($(this).data('id'));
  // });

});