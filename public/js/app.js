const socket = io();

if (navigator.geolocation) {
    let userMarker = null; // User's live location marker

    // Watch for live location updates
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // Emit location to the server
            socket.emit("send-location", { latitude, longitude });

            // Update or create user marker
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]); // Move existing marker
            } else {
                userMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                    }),
                }).addTo(map).bindPopup("You are here").openPopup();
            }

            // Move the map smoothly to the user's location
            map.setView([latitude, longitude], map.getZoom(), { animate: true });
        },
        (error) => {
            console.error("Geolocation error:", error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Initialize the map centered at a default position
const map = L.map("map").setView([0, 0], 16);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Vishwakarma Government Engineering College",
    maxZoom: 18,
}).addTo(map);

const markers = {};

// Listen for other users' locations
socket.on("receive-location", (data) => {
    const { latitude, longitude, id } = data;

    if (!id || id === socket.id) return; // Ignore the current user's own location

    // Update or create marker for other users
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], {
            icon: L.icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                iconSize: [30, 30],
                iconAnchor: [15, 30],
            }),
        }).addTo(map)
        .bindPopup(`User ${id} Location`)
        .openPopup();
    }
});

// Remove disconnected users' markers
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
