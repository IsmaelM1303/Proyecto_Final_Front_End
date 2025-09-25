import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../../api/Crud"
import "../../../styles/NuevoPOI.css"

function POIs() {
    const navegar = useNavigate()

    const [listaPOIs, setListaPOIs] = useState([])
    const [listaSolicitudes, setListaSolicitudes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [mensajeError, setMensajeError] = useState("")

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    useEffect(function() {
        async function cargarDatos() {
            setCargando(true)
            setMensajeError("")
            try {
                const datosPOIs = await obtenerElementos("POIs", 3)
                if (Array.isArray(datosPOIs)) {
                    setListaPOIs(datosPOIs)
                }

                const datosSolicitudes = await obtenerElementos("solicitudPOIs", 3)
                if (Array.isArray(datosSolicitudes)) {
                    if (token) {
                        const propias = datosSolicitudes.filter(function(solicitud) {
                            return String(solicitud.token) === String(token)
                        })
                        setListaSolicitudes(propias)
                    } else {
                        setListaSolicitudes(datosSolicitudes)
                    }
                }
            } catch (error) {
                console.error("Error cargando POIs:", error)
                setMensajeError("No se pudieron cargar los puntos turísticos.")
            } finally {
                setCargando(false)
            }
        }
        cargarDatos()
    }, [token])

    function manejarEditar(poi) {
        try {
            localStorage.setItem("poiEditar", JSON.stringify(poi))
            navegar("/EditarPOI")
        } catch (error) {
            console.error("Error guardando referencia del POI:", error)
        }
    }

    return (
        <div>
            <h2>Mis puntos turísticos</h2>

            {cargando && <p>Cargando datos...</p>}
            {mensajeError && <p className="error">{mensajeError}</p>}

            <div className="contenedor">
                {listaPOIs.length > 0 && (
                    <div>
                        <h3>POIs aceptados</h3>
                        <ul className="poi-list">
                            {listaPOIs.map(function(poi) {
                                return (
                                    <li key={poi.id} className="poi-item">
                                        <strong>{poi.nombre}</strong>
                                        <p>{poi.descripcion}</p>
                                        {poi.ubicacion && (
                                            <small>
                                                {poi.ubicacion.lat}, {poi.ubicacion.lng}
                                            </small>
                                        )}
                                        <div>
                                            <button onClick={function() { manejarEditar(poi) }}>
                                                Editar
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}

                {listaPOIs.length === 0 && !cargando && (
                    <p>No tienes POIs aceptados todavía.</p>
                )}

                {listaSolicitudes.length > 0 && (
                    <div>
                        <h3>Solicitudes en revisión</h3>
                        <ul className="poi-list">
                            {listaSolicitudes.map(function(solicitud) {
                                return (
                                    <li key={solicitud.id} className="poi-item pending">
                                        <strong>{solicitud.nombre}</strong>
                                        <p>{solicitud.descripcion}</p>
                                        <small>Estado: En revisión</small>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            <button onClick={function() { navegar("/NuevoPOI") }}>
                Solicitar nuevo punto turístico
            </button>
        </div>
    )
}

export default POIs
