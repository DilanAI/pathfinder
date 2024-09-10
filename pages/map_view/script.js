document.addEventListener('DOMContentLoaded', () => {
    // Check if storedLocations is loaded
    if (typeof storedLocations !== 'undefined' && storedLocations.length > 0) {
        console.log('Stored Locations Loaded:', storedLocations);
    } else {
        console.error('Failed to load storedLocations from data.js');
    }

    // Add event listener to the "Edit" button to open a new tab
    const editButton = document.querySelector('#edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            // Serialize the table data
            const tableData = Array.from(document.querySelectorAll('#locations-table tbody tr')).map(row => {
                return {
                    name: row.children[0].textContent.trim(),
                    phone: row.children[1]?.textContent.trim(), // Optional, adjust as necessary
                    lat: parseFloat(row.children[2]?.textContent.trim()), // Ensure numbers are parsed correctly
                    lng: parseFloat(row.children[3]?.textContent.trim()) // Ensure numbers are parsed correctly
                };
            });

            // Store data in local storage
            localStorage.setItem('tableData', JSON.stringify(tableData));

            // Open a new tab with the table.html
            window.open('table.html', '_blank');
        });
    } else {
        console.error('Edit button not found');
    }
});

var mapClickEnabled = true;
var addedLocationIds = new Set(); // To keep track of added locations
var allLocations = []; // To store all added locations globally

var map = L.map('map').setView([7.004510, 80.689503],9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var points = [];
var markers = [];
var distanceThreshold = 5; // Example threshold in km

// Initialize distanceControl
var distanceControl = L.control({ position: 'topright' });

distanceControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'distance-control');
    div.innerHTML = 'Total Distance: 0 Nm'; // Updated label
    return div;
};

function updateDistanceControl() {
    var totalDistance = calculateTotalDistance(points);
    distanceControl.getContainer().innerHTML = 'Total Distance: ' + totalDistance.toFixed(2) + ' nautical miles';
}

distanceControl.addTo(map);

function onMapClick(e) {
    if (!mapClickEnabled) return;

    var newPoint = e.latlng;
    points.push(newPoint);

    let marker = L.marker(newPoint).addTo(map).bindPopup(`Point ${points.length}`).openPopup();
    markers.push(marker);

    if (points.length > 1) {
        var polyline = L.polyline(points, { color: 'green' }).addTo(map);
        markers.push(polyline);

        var nearbyLocations = findNearbyLocations(points, storedLocations, distanceThreshold);
        console.log("Nearby locations within " + distanceThreshold + "km:", nearbyLocations);

        // Add markers for the new nearby locations
        nearbyLocations.forEach(location => {
            let nearbyMarker = L.marker([location.lat, location.lng]).addTo(map);
            markers.push(nearbyMarker);
        });

        // Update the table with the newly found nearby locations
        updateTable(nearbyLocations);

        // Show the table after the first point is selected
        document.querySelector('.info-table').style.display = 'block';

        // Calculate the total distance of the polyline connecting all selected points
        var totalDistance = calculateTotalDistance(points);

        // Update the distance control with the total distance
        distanceControl.getContainer().innerHTML = 'Total Distance: ' + totalDistance.toFixed(2) + ' Nm';
    }
}

function updateTable(orderedLocations) {
    console.log("Updating table with:", orderedLocations);

    var tableBody = document.querySelector('#locations-table tbody');

    orderedLocations.forEach(location => {
        if (!addedLocationIds.has(location.id)) {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td>${location.name || 'N/A'}</td>
               
            `;
            tableBody.appendChild(row);
            addedLocationIds.add(location.id); // Mark this location as added
            allLocations.push(location); // Add to global list
        }
    });
}

// Button to clear the map
var clearButton = L.control({ position: 'topleft' });

clearButton.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'clear-button');
    div.innerHTML = '<button type="button" class="big-clear-button">Clear Map</button>';
    div.onclick = function() {
        clearMap();
    };
    return div;
};

clearButton.addTo(map);


function clearMap() {
    mapClickEnabled = false;

    // Clear points and markers from the map
    points = [];
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Hide the information table
    document.querySelector('.info-table').style.display = 'none';

    // Reset distance control
    distanceControl.getContainer().innerHTML = 'Total Distance: 0 Nm';

    // Clear the set of added location IDs
    addedLocationIds.clear(); 

    // Clear the global list of all locations
    allLocations = []; 

    // Clear any other variables or data structures that store point-related data
    // For example, if you're using a separate array or object to store location data, reset it here
    selectedLocations = []; // Assuming you have this variable

    // Clear the content of the table
    const tableBody = document.querySelector('.info-table tbody');
    if (tableBody) {
        tableBody.innerHTML = ''; // Clear the table rows
    }

    // Re-enable map click after a short delay
    setTimeout(function() {
        mapClickEnabled = true;
    }, 100);
}


map.on('click', onMapClick);
