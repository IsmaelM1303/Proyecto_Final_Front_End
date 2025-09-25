import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useRef } from 'react'
import "../../styles/Mapa.css"
import { obtenerElementos } from "../../api/Crud"
import MarkerClusterGroup from 'react-leaflet-cluster'


import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import filtroIcon from "../../assets/Imgs/menu.png"

// Configuración segura de íconos Leaflet (evita problemas con HMR y producción)
if (L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl
    })
}

// Icono verde personalizado para POIs
const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

function FitCostaRicaBounds({ onCentered }) {
    const map = useMap()

    useEffect(() => {
        const bounds = [
            [8.032, -85.950],
            [11.219, -82.555]
        ]
        map.fitBounds(bounds, { padding: [20, 20] })
        if (typeof onCentered === 'function') {
            onCentered()
        }
    }, [map, onCentered])

    return null
}

async function fetchFeaturesPorCodigo(codigo) {
    const url = `https://raw.githubusercontent.com/schweini/CR_distritos_geojson/master/geojson/${codigo}.geojson`
    try {
        const res = await fetch(url)
        if (!res.ok) {
            console.warn(`No se pudo cargar ${codigo}`)
            return []
        }
        const data = await res.json()
        if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
            return data.features
        }
        if (data && data.type === 'Feature') {
            return [data]
        }
        return []
    } catch (err) {
        console.error(`Error cargando ${codigo}:`, err)
        return []
    }
}

function Mapa() {
    // División territorial y UI de filtros
    const [division, setDivision] = useState("") // "", "provincia", "canton"
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("")
    const [mostrarSelectCantones, setMostrarSelectCantones] = useState(false)
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    // Geometrías
    const datosByCodigoRef = useRef({})
    const [geoData, setGeoData] = useState(null)
    const [geoKey, setGeoKey] = useState(0)
    const [cargandoDivisiones, setCargandoDivisiones] = useState(true)

    // Marcador inicial
    const [mostrarMarcador, setMostrarMarcador] = useState(true)

    // POIs
    const [pois, setPois] = useState([])
    const [cargandoPOIs, setCargandoPOIs] = useState(true)
    const [errorPOIs, setErrorPOIs] = useState('')

    // Provincias y cantones
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

    // Precargar geometrías de provincias
    useEffect(() => {
        async function precargarProvincias() {
            try {
                const yaCargado = Object.keys(datosByCodigoRef.current).length > 0
                if (yaCargado) {
                    setCargandoDivisiones(false)
                    return
                }
                const tabla = {}
                for (let i = 0; i < provincias.length; i++) {
                    const p = provincias[i]
                    const features = await fetchFeaturesPorCodigo(p.codigo)
                    tabla[p.codigo] = features
                }
                datosByCodigoRef.current = tabla
            } catch (e) {
                console.error('Error precargando provincias:', e)
            } finally {
                setCargandoDivisiones(false)
            }
        }
        precargarProvincias()
    }, [])

    // Cargar POIs aceptados (server 3)
    useEffect(() => {
        async function cargarPOIs() {
            setCargandoPOIs(true)
            setErrorPOIs('')
            try {
                const data = await obtenerElementos("POIs", 3)
                if (Array.isArray(data)) {
                    setPois(data)
                } else {
                    setPois([])
                }
            } catch (err) {
                console.error("Error cargando POIs:", err)
                setErrorPOIs('No se pudieron cargar los POIs.')
            } finally {
                setCargandoPOIs(false)
            }
        }
        cargarPOIs()
    }, [])

    // Acciones de división
    function mostrarProvincias() {
        setDivision("provincia")
        setMostrarSelectCantones(false)
        setProvinciaSeleccionada("")
        setGeoData(null)

        const features = provincias.flatMap(p => datosByCodigoRef.current[p.codigo] || [])
        setGeoKey(prev => prev + 1)
        setGeoData({ type: "FeatureCollection", features })
    }

    function activarCantones() {
        setDivision("canton")
        setMostrarSelectCantones(true)
        setProvinciaSeleccionada("")
        setGeoData(null)
    }

    async function mostrarCantonesProvincia(codigoProvincia) {
        setProvinciaSeleccionada(codigoProvincia)
        setGeoData(null)

        const prov = provincias.find(p => p.codigo === codigoProvincia)
        if (!prov) {
            return
        }

        for (let i = 0; i < prov.cantones.length; i++) {
            const c = prov.cantones[i]
            if (!datosByCodigoRef.current[c]) {
                const features = await fetchFeaturesPorCodigo(c)
                datosByCodigoRef.current[c] = features
            }
        }

        const features = prov.cantones.flatMap(c => datosByCodigoRef.current[c] || [])
        setGeoKey(prev => prev + 1)
        setGeoData({ type: "FeatureCollection", features })
    }

    function limpiar() {
        setDivision("")
        setProvinciaSeleccionada("")
        setMostrarSelectCantones(false)
        setGeoData(null)
    }

    // Render de filtros
    function renderPanelFiltros() {
        return (
            <div className="panel-filtros-wrapper">
                {/* Botón para abrir/cerrar */}
                <img
                    src={filtroIcon}
                    alt="Mostrar filtros"
                    className="filtro-icon"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    style={{ cursor: "pointer", width: 40, height: 40 }}
                />

                {/* Panel colapsable */}
                <div className={`panel-filtros ${mostrarFiltros ? "abierto" : "cerrado"}`}>

                    <div className="panel-filtros-controls">
                        <button onClick={mostrarProvincias} disabled={cargandoDivisiones}>
                            Mostrar Provincias
                        </button>

                        {mostrarSelectCantones === false && (
                            <button onClick={activarCantones} disabled={cargandoDivisiones}>
                                Mostrar Cantones
                            </button>
                        )}

                        {mostrarSelectCantones === true && (
                            <select
                                value={provinciaSeleccionada}
                                onChange={(e) => mostrarCantonesProvincia(e.target.value)}
                                disabled={cargandoDivisiones}
                            >
                                <option value="">-- Selecciona una provincia --</option>
                                {provincias.map((p) => (
                                    <option key={p.codigo} value={p.codigo}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button onClick={limpiar} disabled={cargandoDivisiones}>
                            Limpiar
                        </button>

                        {cargandoDivisiones && (
                            <span style={{ marginLeft: 12 }}>Cargando divisiones…</span>
                        )}
                    </div>
                </div>
            </div>
        )
    }


    // Render de marcadores de POIs
    function renderPOIs() {
        const hayPOIs = Array.isArray(pois) && pois.length > 0
        if (!hayPOIs) {
            return null
        }

        const markers = []

        for (let i = 0; i < pois.length; i++) {
            const poi = pois[i]

            let lat = null
            let lng = null
            if (poi && poi.ubicacion && typeof poi.ubicacion.lat === 'number') {
                lat = poi.ubicacion.lat
            }
            if (poi && poi.ubicacion && typeof poi.ubicacion.lng === 'number') {
                lng = poi.ubicacion.lng
            }
            if (lat === null || lng === null) {
                continue
            }

            const categorias = Array.isArray(poi.categorias) ? poi.categorias : []
            const redes = Array.isArray(poi.redes) ? poi.redes : []

            let markerKey = `poi-${i}`
            if (poi && poi.id) {
                markerKey = `poi-${poi.id}`
            }

            markers.push(
                <Marker key={markerKey} position={[lat, lng]} icon={greenIcon}>
                    <Popup>
                        <div style={{ maxWidth: 260 }}>
                            <strong>{poi && poi.nombre ? poi.nombre : 'POI'}</strong>

                            {poi && poi.descripcion && (
                                <p style={{ margin: '6px 0' }}>{poi.descripcion}</p>
                            )}

                            {categorias.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <span style={{ fontWeight: 600 }}>Categorías:</span>
                                    <ul style={{ paddingLeft: 16, margin: '4px 0' }}>
                                        {categorias.map((c, j) => {
                                            return <li key={j}>{c}</li>
                                        })}
                                    </ul>
                                </div>
                            )}

                            {redes.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <span style={{ fontWeight: 600 }}>Redes:</span>
                                    <ul style={{ paddingLeft: 16, margin: '4px 0' }}>
                                        {redes.map((r, j) => {
                                            let tipo = 'Link'
                                            if (r && r.tipo) {
                                                tipo = r.tipo
                                            }
                                            let link = ''
                                            if (r && r.link) {
                                                link = r.link
                                            }

                                            if (link) {
                                                return (
                                                    <li key={j}>
                                                        {tipo}: <a href={link} target="_blank" rel="noreferrer">{link}</a>
                                                    </li>
                                                )
                                            }
                                            return <li key={j}>{tipo}: —</li>
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            )
        }

        return markers
    }

    return (
        <div>
            <div className="filtros-mapa">
                {renderPanelFiltros()}
            </div>

            <MapContainer
                center={[9.9, -84.1]}
                zoom={8}
                scrollWheelZoom={true}
                className="mapa-container"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {!division && (
                    <FitCostaRicaBounds onCentered={() => setMostrarMarcador(false)} />
                )}

                {mostrarMarcador && (
                    <Marker position={[9.9281, -84.0907]}>
                        <Popup>
                            San José, Costa Rica <br /> Marcador inicial
                        </Popup>
                    </Marker>
                )}

                {geoData && (
                    <GeoJSON
                        key={geoKey}
                        data={geoData}
                        style={estiloDivision}
                    />
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={(cluster) => {
                        return L.divIcon({
                            html: `<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" 
                  style="width:25px;height:41px;" />`,
                            className: "custom-cluster-icon",
                            iconSize: [25, 41],
                            iconAnchor: [12, 41]
                        })
                    }}
                >
                    {renderPOIs()}
                </MarkerClusterGroup>

            </MapContainer>

            <div className="estado-pois">
                {cargandoPOIs && <p>Cargando POIs…</p>}
                {!cargandoPOIs && pois.length === 0 && !errorPOIs && <p>No hay POIs disponibles aún.</p>}
                {errorPOIs && <p className="error">{errorPOIs}</p>}
            </div>
        </div>
    )
}

export default Mapa