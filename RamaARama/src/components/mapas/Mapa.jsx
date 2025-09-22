import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import "../../styles/Mapa.css"

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Fix para íconos de marcador
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
})

function FitCostaRicaBounds({ onCentered }) {
    const map = useMap()
    useEffect(() => {
        const bounds = [
            [8.032, -85.950],
            [11.219, -82.555]
        ]
        map.fitBounds(bounds, { padding: [20, 20] })
        if (onCentered) onCentered()
    }, [map, onCentered])
    return null
}

// Trae un archivo GeoJSON y devuelve sus features
async function fetchFeaturesPorCodigo(codigo) {
    const url = `https://raw.githubusercontent.com/schweini/CR_distritos_geojson/master/geojson/${codigo}.geojson`
    try {
        const res = await fetch(url)
        if (!res.ok) {
            console.warn(`No se pudo cargar ${codigo}`)
            return []
        }
        const data = await res.json()
        if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) return data.features
        if (data?.type === 'Feature') return [data]
        return []
    } catch (err) {
        console.error(`Error cargando ${codigo}:`, err)
        return []
    }
}

export default function Mapa() {
    const [division, setDivision] = useState("")
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("")
    const [mostrarMarcador, setMostrarMarcador] = useState(true)

    const [datosByCodigo, setDatosByCodigo] = useState({})
    const [geoData, setGeoData] = useState(null)
    const [geoKey, setGeoKey] = useState(0) // clave para forzar re-render
    const [cargando, setCargando] = useState(true)
    const [mostrarSelectCantones, setMostrarSelectCantones] = useState(false)

    const provincias = [
        { codigo: "1", nombre: "San José", cantones: ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120"] },
        { codigo: "2", nombre: "Alajuela", cantones: ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215"] },
        { codigo: "3", nombre: "Cartago", cantones: ["301", "302", "303", "304", "305", "306", "307", "308"] },
        { codigo: "4", nombre: "Heredia", cantones: ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410"] },
        { codigo: "5", nombre: "Guanacaste", cantones: ["501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511"] },
        { codigo: "6", nombre: "Puntarenas", cantones: ["601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611"] },
        { codigo: "7", nombre: "Limón", cantones: ["701", "702", "703", "704", "705", "706"] }
    ]

    const estiloDivision = { color: "#4e770dff", weight: 2, opacity: 0.65 }

    // Precarga de todos los datos
    useEffect(() => {
        async function precargar() {
            const tabla = {}
            for (const p of provincias) {
                tabla[p.codigo] = await fetchFeaturesPorCodigo(p.codigo)
                for (const c of p.cantones) {
                    tabla[c] = await fetchFeaturesPorCodigo(c)
                }
            }
            setDatosByCodigo(tabla)
            setCargando(false)
        }
        precargar()
    }, [])

    const mostrarProvincias = () => {
        setDivision("provincia")
        setMostrarSelectCantones(false)
        setProvinciaSeleccionada("")
        setGeoData(null) // limpia capa actual
        const features = provincias.flatMap(p => datosByCodigo[p.codigo] || [])
        setGeoKey(prev => prev + 1) // fuerza re-render
        setGeoData({ type: "FeatureCollection", features })
    }

    const activarCantones = () => {
        setDivision("canton")
        setMostrarSelectCantones(true)
        setProvinciaSeleccionada("")
        setGeoData(null)
    }

    const mostrarCantonesProvincia = (codigoProvincia) => {
        setProvinciaSeleccionada(codigoProvincia)
        setGeoData(null)
        const prov = provincias.find(p => p.codigo === codigoProvincia)
        if (!prov) return
        const features = prov.cantones.flatMap(c => datosByCodigo[c] || [])
        setGeoKey(prev => prev + 1)
        setGeoData({ type: "FeatureCollection", features })
    }

    const limpiar = () => {
        setDivision("")
        setProvinciaSeleccionada("")
        setMostrarSelectCantones(false)
        setGeoData(null)
    }

    return (
        <div>
            <div className="filtros-mapa">
                <button onClick={mostrarProvincias} disabled={cargando}>Mostrar Provincias</button>

                {!mostrarSelectCantones ? (
                    <button onClick={activarCantones} disabled={cargando}>Mostrar Cantones</button>
                ) : (
                    <select
                        value={provinciaSeleccionada}
                        onChange={(e) => mostrarCantonesProvincia(e.target.value)}
                        disabled={cargando}
                    >
                        <option value="">-- Selecciona una provincia --</option>
                        {provincias.map(p => (
                            <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                        ))}
                    </select>
                )}

                <button onClick={limpiar} disabled={cargando}>Limpiar</button>
                {cargando && <span style={{ marginLeft: 12 }}>Cargando datos…</span>}
            </div>

            <MapContainer
                center={[9.9, -84.1]}
                zoom={8}
                scrollWheelZoom={true}
                className="mapa-container"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
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

                {geoData && (
                    <GeoJSON
                        key={geoKey} // fuerza desmontar/montar
                        data={geoData}
                        style={estiloDivision}
                    />
                )}
            </MapContainer>
        </div>
    )
}
