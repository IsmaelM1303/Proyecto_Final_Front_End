import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import "../../styles/Mapa.css"

// Importar imágenes de marcador
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Fix para íconos de marcador en React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
})

// Componente auxiliar para ajustar el mapa a Costa Rica al inicio
function FitCostaRicaBounds({ onCentered }) {
    const map = useMap()
    useEffect(() => {
        const bounds = [
            [8.032, -85.950], // Suroeste
            [11.219, -82.555] // Noreste
        ]
        map.fitBounds(bounds, { padding: [20, 20] })
        // Avisar que ya centramos
        if (onCentered) {
            onCentered()
        }
    }, [map, onCentered])
    return null
}

// Función para cargar y unir varios GeoJSON
async function cargarMultiplesGeoJSON(codigos) {
    const baseUrl = "https://raw.githubusercontent.com/schweini/CR_distritos_geojson/master/geojson/"
    const features = []

    for (const codigo of codigos) {
        try {
            const res = await fetch(`${baseUrl}${codigo}.geojson`)
            if (res.ok) {
                const data = await res.json()

                if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
                    features.push(...data.features)
                } else if (data.type === "Feature") {
                    features.push(data)
                } else {
                    console.warn(`Formato desconocido en ${codigo}.geojson`, data)
                }
            } else {
                console.warn(`No se pudo cargar ${codigo}.geojson: HTTP ${res.status}`)
            }
        } catch (error) {
            console.error(`Error cargando ${codigo}.geojson`, error)
        }
    }

    return {
        type: "FeatureCollection",
        features
    }
}

function Mapa() {
    const [division, setDivision] = useState("") // provincia o canton
    const [geoData, setGeoData] = useState(null)
    const [mapRef, setMapRef] = useState(null)
    const [mostrarMarcador, setMostrarMarcador] = useState(true)

    useEffect(() => {
        async function cargarGeoJSON() {
            if (division === "provincia") {
                const provincias = ["1", "2", "3", "4", "5", "6", "7"]
                const data = await cargarMultiplesGeoJSON(provincias)
                setGeoData(data)
                ajustarVista(data)
            } else if (division === "canton") {
                const cantones = [
                    "101", "102", "103", "104", "105", "106", "107", "108", "109", "110",
                    "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", 
                    "201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
                    "211", "212", "213", "214", "215", 
                    "301", "302", "303", "304", "305", "306", "307", "308",
                    "401", "402", "403", "404", "405", "406", "407", "408", "409", "410",
                    "501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511",
                    "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611",
                    "701", "702", "703", "704", "705", "706"
                ]
                const data = await cargarMultiplesGeoJSON(cantones)
                setGeoData(data)
                ajustarVista(data)
            } else {
                setGeoData(null)
            }
        }

        function ajustarVista(data) {
            if (mapRef && data && data.features.length > 0) {
                const layer = L.geoJSON(data)
                mapRef.fitBounds(layer.getBounds(), { padding: [20, 20] })
            }
        }

        cargarGeoJSON()
    }, [division, mapRef])

    const estiloDivision = {
        color: "#ff7800",
        weight: 2,
        opacity: 0.65
    }

    return (
        <div>
            {/* Contenedor de filtros */}
            <div className="filtros-mapa">
                <button onClick={() => setDivision("provincia")}>Mostrar Provincias</button>
                <button onClick={() => setDivision("canton")}>Mostrar Cantones</button>
                <button onClick={() => setDivision("")}>Limpiar</button>
            </div>

            {/* Mapa */}
            <MapContainer
                center={[9.9, -84.1]}
                zoom={8}
                scrollWheelZoom={true}
                className="mapa-container"
                whenCreated={setMapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {!division && (
                    <FitCostaRicaBounds onCentered={() => setMostrarMarcador(false)} />
                )}

                {mostrarMarcador && (
                    <Marker position={[9.9281, -84.0907]}>
                        <Popup>
                            San José, Costa Rica <br /> ¡Aquí está el marcador!
                        </Popup>
                    </Marker>
                )}

                {geoData && <GeoJSON data={geoData} style={estiloDivision} />}
            </MapContainer>
        </div>
    )
}

export default Mapa
