import "./App.css";
import MapComponent from "./components/Map/MapComponent";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<MapComponent />
		</div>
	);
}

export default App;
