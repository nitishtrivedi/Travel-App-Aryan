import React from "react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
	"pk.eyJ1IjoiYXJ5YW5zcmkxNjI1IiwiYSI6ImNtNWF1aGN2eDIzbWQydHFycmJvMXBqYzQifQ.0H8HIo1Myij4pM6jXTFaOw";

const locations = [
	{
		name: "Shaniwar Wada",
		coordinates: [73.8554, 18.5196],
		description: "Shaniwar Wada, Pune",
	},
	{
		name: "Aga Khan Palace",
		coordinates: [73.9023, 18.5521],
		description: "Aga Khan Palace, Pune",
	},
];

export default function MapComponent() {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(0);
	const [lat, setLat] = useState(0);
	const [zoom, setZoom] = useState(13);
	const [style, setStyle] = useState("streets-v12");

	// Function to get current location
	const getCurrentLocation = () => {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error getting location:", error);
					reject(error);
				}
			);
		});
	};

	useEffect(() => {
		const initializeMap = async () => {
			try {
				// Get current location
				const position = await getCurrentLocation();
				setLat(position.lat);
				setLng(position.lng);

				if (!map.current && mapContainer.current) {
					map.current = new mapboxgl.Map({
						container: mapContainer.current,
						style: `mapbox://styles/mapbox/${style}`,
						center: [position.lng, position.lat],
						zoom: zoom,
					});

					// Add navigation controls
					map.current.addControl(
						new mapboxgl.NavigationControl(),
						"top-right"
					);

					// Add geolocate control
					const geolocate = new mapboxgl.GeolocateControl({
						positionOptions: {
							enableHighAccuracy: true,
						},
						trackUserLocation: true,
						showUserHeading: true,
					});
					map.current.addControl(geolocate, "top-right");

					// Add fullscreen control
					map.current.addControl(
						new mapboxgl.FullscreenControl(),
						"top-right"
					);

					// Add scale control
					map.current.addControl(
						new mapboxgl.ScaleControl(),
						"bottom-right"
					);

					// Update coordinates on map move
					map.current.on("move", () => {
						const center = map.current.getCenter();
						setLng(center.lng.toFixed(4));
						setLat(center.lat.toFixed(4));
						setZoom(map.current.getZoom().toFixed(2));
					});

					// Add a marker at current location
					new mapboxgl.Marker({ color: "blue" })
						.setLngLat([position.lng, position.lat])
						.setPopup(
							new mapboxgl.Popup({ offset: 25 }).setText(
								"Your Current Location"
							)
						)
						.addTo(map.current);

					// Add markers for predefined locations
					locations.forEach((location) => {
						new mapboxgl.Marker({ color: "red" })
							.setLngLat(location.coordinates)
							.setPopup(
								new mapboxgl.Popup({ offset: 25 }).setText(
									`${location.name}: ${location.description}`
								)
							)
							.addTo(map.current);
					});
				}
			} catch (error) {
				console.error("Error initializing map:", error);
			}
		};

		initializeMap();

		return () => {
			if (map.current) {
				try {
					map.current.off();
					const controls = map.current._controls;
					if (controls) {
						controls.forEach((control) => {
							map.current.removeControl(control);
						});
					}
					map.current.remove();
				} catch (e) {
					console.error("Error during map cleanup:", e);
				}
				map.current = null;
			}
		};
	}, [style]);

	// Function to change map style
	const changeMapStyle = (newStyle) => {
		setStyle(newStyle);
		if (map.current) {
			map.current.setStyle(`mapbox://styles/mapbox/${newStyle}`);
		}
	};

	return (
		<div style={{ width: "100%", height: "100vh", position: "relative" }}>
			{/* Controls Panel */}
			<div
				style={{
					position: "absolute",
					top: "10px",
					left: "10px",
					backgroundColor: "white",
					padding: "10px",
					borderRadius: "4px",
					zIndex: 1,
					boxShadow: "0 0 10px rgba(0,0,0,0.3)",
				}}
			>
				<div style={{ marginBottom: "5px" }}>
					Longitude: {lng} | Latitude: {lat}
				</div>
				<div style={{ marginBottom: "10px" }}>Zoom: {zoom}</div>
				<select
					value={style}
					onChange={(e) => changeMapStyle(e.target.value)}
					style={{
						padding: "5px",
						borderRadius: "4px",
						border: "1px solid #ccc",
					}}
				>
					<option value="streets-v12">Streets</option>
					<option value="satellite-v9">Satellite</option>
					<option value="light-v11">Light</option>
					<option value="dark-v11">Dark</option>
					<option value="outdoors-v12">Outdoors</option>
					<option value="navigation-day-v1">Navigation Day</option>
					<option value="navigation-night-v1">
						Navigation Night
					</option>
				</select>
			</div>
			<div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
		</div>
	);
}
