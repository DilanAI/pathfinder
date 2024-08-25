// Global variable to store nearby locations
var nearbyLocations = []; // Initialize as an empty array or set it from elsewhere

function openTableInNewTab() {
    var newTab = window.open('', '_blank');
    newTab.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Table Edit</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="styles.css" />
        </head>
        <body>
            <h2>Editable Table</h2>
            <table id="locations-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Rows will be inserted here -->
                </tbody>
            </table>
            <button id="save-changes" style="margin-top: 10px;">Save Changes</button>
            <script src="edit-functions.js"></script>
        </body>
        </html>
    `);
    newTab.document.close();

    // Ensure nearbyLocations is not empty and is passed correctly
    if (Array.isArray(nearbyLocations) && nearbyLocations.length > 0) {
        populateTableInNewTab(newTab, nearbyLocations);
    } else {
        console.error('No nearby locations available to display.');
    }
}

function populateTableInNewTab(newTab, locations) {
    const tableBody = newTab.document.querySelector('#locations-table tbody');
    locations.forEach(location => {
        const row = newTab.document.createElement('tr');
        row.innerHTML = `
            <td>${location.name}</td>
            <td>${location.lat}</td>
            <td>${location.lng}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Ensure this script runs after the DOM is fully loaded
window.addEventListener('load', function() {
    const editButton = document.getElementById('edit-button');
    if (editButton) {
        editButton.addEventListener('click', openTableInNewTab);
    } else {
        console.error('Edit button not found.');
    }
});
