function initMap() {
    var uluru = {lat: 19, lng: 21};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        draggable: true
    });

    google.maps.event.addListener(marker, 'dragend', function (event) {
        document.getElementsByName('longitude').item(0).value = event.latLng.lng();
        document.getElementsByName('latitude').item(0).value = event.latLng.lat();
    });
}