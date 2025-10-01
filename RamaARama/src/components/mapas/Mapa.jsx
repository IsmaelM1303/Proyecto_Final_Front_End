// src/components/Mapa.jsx
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

import MapaPOIs from "./MapaPOIs"
import MapaFiltros from "./MapaFiltros"

import "../../styles/Mapas/Mapa.css"

// Configuración segura de íconos Leaflet
if (L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl
    })
}

const iconoVerde = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

function AjustarLimitesCostaRica({ alCentrar }) {
    const mapa = useMap()
    useEffect(() => {
        const limites = [
            [8.032, -85.950],
            [11.219, -82.555]
        ]
        mapa.fitBounds(limites, { padding: [20, 20] })
        const esFuncion = typeof alCentrar === "function"
        if (esFuncion) {
            alCentrar()
        }
    }, [mapa, alCentrar])
    return null
}

async function obtenerGeometriasPorCodigo(codigo) {
    const url = `https://raw.githubusercontent.com/schweini/CR_distritos_geojson/master/geojson/${codigo}.geojson`
    try {
        const res = await fetch(url)
        const estadoOk = res.ok
        if (!estadoOk) {
            console.warn("No se pudo cargar " + codigo)
            return []
        }
        const data = await res.json()
        const esColeccion = data && data.type === "FeatureCollection" && Array.isArray(data.features)
        if (esColeccion) {
            return data.features
        }
        const esFeature = data && data.type === "Feature"
        if (esFeature) {
            return [data]
        }
        return []
    } catch (error) {
        console.error("Error cargando " + codigo + ":", error)
        return []
    }
}

function Mapa() {
    const [division, setDivision] = useState("")
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("")
    const [mostrarSelectCantones, setMostrarSelectCantones] = useState(false)
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    const datosPorCodigoRef = useRef({})
    const [datosGeograficos, setDatosGeograficos] = useState(null)
    const [llaveGeo, setLlaveGeo] = useState(0)
    const [cargandoDivisiones, setCargandoDivisiones] = useState(true)

    const [mostrarMarcadorInicial, setMostrarMarcadorInicial] = useState(true)

    const [listaPOIs, setListaPOIs] = useState([])
    const [cargandoPOIs, setCargandoPOIs] = useState(true)
    const [errorPOIs, setErrorPOIs] = useState("")

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

    useEffect(() => {
        async function precargarProvincias() {
            try {
                const yaCargado = Object.keys(datosPorCodigoRef.current).length > 0
                if (yaCargado) {
                    setCargandoDivisiones(false)
                    return
                }
                const tabla = {}
                for (let i = 0; i < provincias.length; i++) {
                    const provincia = provincias[i]
                    const features = await obtenerGeometriasPorCodigo(provincia.codigo)
                    tabla[provincia.codigo] = features
                }
                datosPorCodigoRef.current = tabla
            } catch (error) {
                console.error("Error precargando provincias:", error)
            } finally {
                setCargandoDivisiones(false)
            }
        }
        precargarProvincias()
    }, [])

    useEffect(() => {
        async function cargarPOIs() {
            setCargandoPOIs(true)
            setErrorPOIs("")
            try {
                const data = await obtenerElementos("POIs", 3)
                const esArray = Array.isArray(data)
                if (esArray) {
                    setListaPOIs(data)
                } else {
                    setListaPOIs([])
                }
            } catch (error) {
                console.error("Error cargando POIs:", error)
                setErrorPOIs("No se pudieron cargar los POIs.")
            } finally {
                setCargandoPOIs(false)
            }
        }
        cargarPOIs()
    }, [])

    function mostrarProvincias() {
        setDivision("provincia")
        setMostrarSelectCantones(false)
        setProvinciaSeleccionada("")
        setDatosGeograficos(null)

        const listaFeatures = []
        for (let i = 0; i < provincias.length; i++) {
            const provincia = provincias[i]
            const featuresProvincia = datosPorCodigoRef.current[provincia.codigo]
            const hayFeatures = Array.isArray(featuresProvincia) && featuresProvincia.length > 0
            if (hayFeatures) {
                for (let j = 0; j < featuresProvincia.length; j++) {
                    listaFeatures.push(featuresProvincia[j])
                }
            }
        }
        setLlaveGeo(function (prev) { return prev + 1 })
        setDatosGeograficos({ type: "FeatureCollection", features: listaFeatures })
    }

    function activarCantones() {
        setDivision("canton")
        setMostrarSelectCantones(true)
        setProvinciaSeleccionada("")
        setDatosGeograficos(null)
    }

    async function mostrarCantonesProvincia(codigoProvincia) {
        setProvinciaSeleccionada(codigoProvincia)
        setDatosGeograficos(null)

        const provincia = provincias.find(function (p) { return p.codigo === codigoProvincia })
        const existeProvincia = Boolean(provincia)
        if (!existeProvincia) {
            return
        }

        for (let i = 0; i < provincia.cantones.length; i++) {
            const codigoCanton = provincia.cantones[i]
            const yaExiste = Boolean(datosPorCodigoRef.current[codigoCanton])
            if (!yaExiste) {
                const features = await obtenerGeometriasPorCodigo(codigoCanton)
                datosPorCodigoRef.current[codigoCanton] = features
            }
        }

        const listaFeaturesCantones = []
        for (let k = 0; k < provincia.cantones.length; k++) {
            const codigoCanton2 = provincia.cantones[k]
            const featuresCanton = datosPorCodigoRef.current[codigoCanton2]
            const hayFeaturesCanton = Array.isArray(featuresCanton) && featuresCanton.length > 0
            if (hayFeaturesCanton) {
                for (let m = 0; m < featuresCanton.length; m++) {
                    listaFeaturesCantones.push(featuresCanton[m])
                }
            }
        }

        setLlaveGeo(function (prev) { return prev + 1 })
        setDatosGeograficos({ type: "FeatureCollection", features: listaFeaturesCantones })
    }

    function limpiar() {
        setDivision("")
        setProvinciaSeleccionada("")
        setMostrarSelectCantones(false)
        setDatosGeograficos(null)
    }

    // Elementos condicionales del mapa (sin ternarios)
    let componenteLimites = null
    const noHayDivision = division === ""
    if (noHayDivision) {
        componenteLimites = <AjustarLimitesCostaRica alCentrar={function () { setMostrarMarcadorInicial(false) }} />
    }

    let componenteMarcadorInicial = null
    const debeMostrarMarcadorInicial = mostrarMarcadorInicial === true
    if (debeMostrarMarcadorInicial) {
        componenteMarcadorInicial = (
            <Marker position={[9.9281, -84.0907]}>
                <Popup>
                    San José, Costa Rica <br /> Marcador inicial
                </Popup>
            </Marker>
        )
    }

    let componenteGeoJson = null
    const hayDatosGeo = Boolean(datosGeograficos)
    if (hayDatosGeo) {
        componenteGeoJson = (
            <GeoJSON
                key={llaveGeo}
                data={datosGeograficos}
                style={estiloDivision}
            />
        )
    }

    // Estado de POIs (sin ternarios)
    let componenteEstadoPOIs = null
    const estaCargandoPOIs = cargandoPOIs === true
    if (estaCargandoPOIs) {
        componenteEstadoPOIs = <p>Cargando POIs…</p>
    } else {
        const sinPOIs = Array.isArray(listaPOIs) && listaPOIs.length === 0
        const hayErrorPOIs = Boolean(errorPOIs)
        if (sinPOIs && !hayErrorPOIs) {
            componenteEstadoPOIs = <p>No hay POIs disponibles aún.</p>
        }
        if (hayErrorPOIs) {
            componenteEstadoPOIs = <p className="error">{errorPOIs}</p>
        }
    }

    return (
        <div className="divMapa">
            {/* Filtros flotantes sobre el mapa */}
            <div className="filtros-mapa">
                <MapaFiltros
                    mostrarProvincias={mostrarProvincias}
                    activarCantones={activarCantones}
                    mostrarCantonesProvincia={mostrarCantonesProvincia}
                    limpiar={limpiar}
                    cargandoDivisiones={cargandoDivisiones}
                    mostrarSelectCantones={mostrarSelectCantones}
                    provinciaSeleccionada={provinciaSeleccionada}
                    provincias={provincias}
                    mostrarFiltros={mostrarFiltros}
                    setMostrarFiltros={setMostrarFiltros}
                />
            </div>

            {/* Contenedor del mapa */}
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

                {componenteLimites}
                {componenteMarcadorInicial}
                {componenteGeoJson}

                <MarkerClusterGroup
                    chunkedLoading={true}
                    iconCreateFunction={function (cluster) {
                        return L.divIcon({
                            html: '<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" style="width:25px;height:41px;" />',
                            className: "custom-cluster-icon",
                            iconSize: [25, 41],
                            iconAnchor: [12, 41]
                        })
                    }}
                >
                    <MapaPOIs pois={listaPOIs} iconoVerde={iconoVerde} />
                </MarkerClusterGroup>
            </MapContainer>

            {/* Estado de POIs flotante */}
            <div className="estado-pois">
                {componenteEstadoPOIs}
            </div>
        </div>
    )

}

export default Mapa
