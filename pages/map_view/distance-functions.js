// Calculate distance between two points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the Earth in kilometers
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 
        0.5 - Math.cos(dLat) / 2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

// Convert kilometers to nautical miles
function calculateDistanceInNauticalMiles(lat1, lon1, lat2, lon2) {
    var distanceInKm = calculateDistance(lat1, lon1, lat2, lon2);
    return distanceInKm / 1.852; // Convert kilometers to nautical miles
}

// Calculate distance from a point to a line segment
function distanceFromLine(lat, lng, lat1, lng1, lat2, lng2) {
    var A = lat - lat1;
    var B = lng - lng1;
    var C = lat2 - lat1;
    var D = lng2 - lng1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = dot / len_sq;

    var xx, yy;

    if (param < 0 || (lat1 == lat2 && lng1 == lng2)) {
        xx = lat1;
        yy = lng1;
    } else if (param > 1) {
        xx = lat2;
        yy = lng2;
    } else {
        xx = lat1 + param * C;
        yy = lng1 + param * D;
    }

    var dLat = lat - xx;
    var dLng = lng - yy;
    return calculateDistanceInNauticalMiles(lat, lng, xx, yy);
}

// Find locations within a specified distance from a polyline
function findNearbyLocations(points, locations, thresholdNm) {
    var orderedLocations = [];

    if (points.length < 2) return orderedLocations; // Need at least two points to define a line

    for (var i = 0; i < points.length - 1; i++) {
        var segmentLocations = [];

        locations.forEach(location => {
            var distance = distanceFromLine(location.lat, location.lng, points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);

            // Check if the distance is within the threshold
            if (distance <= thresholdNm) {
                segmentLocations.push({
                    location: location,
                    distanceToStart: getDistance(location.lat, location.lng, points[i].lat, points[i].lng)
                });
            }
        });

        // Sort the segment locations by their distance to the starting point of the segment
        segmentLocations.sort((a, b) => a.distanceToStart - b.distanceToStart);

        // Extract just the location objects in order
        segmentLocations.forEach(entry => orderedLocations.push(entry.location));
    }

    return orderedLocations;
}

// Calculate distance between two points in nautical miles
function getDistance(lat1, lng1, lat2, lng2) {
    var R = 6371e3; // Radius of the Earth in meters
    var φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    var φ2 = lat2 * Math.PI / 180;
    var Δφ = (lat2 - lat1) * Math.PI / 180;
    var Δλ = (lng2 - lng1) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var distance = R * c; // in meters
    return distance / 1852; // Convert meters to nautical miles
}

// Calculate total distance of a polyline
function calculateTotalDistance(points) {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += calculateDistanceInNauticalMiles(
            points[i].lat, points[i].lng,
            points[i + 1].lat, points[i + 1].lng
        );
    }
    return totalDistance;
}

// Example usage
var points = [
    { lat: 7.293, lng: 80.633 },
    { lat: 7.295, lng: 80.635 }
];

var locations = [
    { lat: 7.294, lng: 80.634 },
    { lat: 7.296, lng: 80.636 }
];

// Threshold of 10 nautical miles
var thresholdNm = 0; 
var nearbyLocations = findNearbyLocations(points, locations, thresholdNm);

console.log(nearbyLocations);
