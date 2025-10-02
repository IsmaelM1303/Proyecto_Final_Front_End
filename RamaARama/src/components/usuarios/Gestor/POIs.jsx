import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../../api/Crud"
import "../../../styles/NuevoPOI.css"
import "../../../styles/POIs.css"

/**
 * Componente POIs
 * Muestra la lista de puntos turísticos (POIs) aceptados y las solicitudes en revisión del usuario.
 * Permite editar POIs aceptados y solicitar nuevos puntos turísticos.
 * Carga los datos desde la base simulada y filtra las solicitudes por el usuario autenticado.
 */
function POIs() {
    const navegar = useNavigate()

    // Estados para la lista de POIs y solicitudes
    const [listaPOIs, setListaPOIs] = useState([])
    const [listaSolicitudes, setListaSolicitudes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [mensajeError, setMensajeError] = useState("")

    // Token del usuario autenticado
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    // Efecto para cargar POIs y solicitudes al montar el componente
    useEffect(function () {
        async function cargarDatos() {
            setCargando(true)
            setMensajeError("")
            try {
                // Carga POIs aceptados
                const datosPOIs = await obtenerElementos("POIs", 3)
                if (Array.isArray(datosPOIs)) {
                    setListaPOIs(datosPOIs)
                }

                // Carga solicitudes de POIs en revisión
                const datosSolicitudes = await obtenerElementos("solicitudPOIs", 3)
                if (Array.isArray(datosSolicitudes)) {
                    if (token) {
                        // Filtra solo las solicitudes del usuario actual
                        const propias = datosSolicitudes.filter(function (solicitud) {
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

    // Maneja la edición de un POI: guarda referencia en localStorage y navega a la edición
    function manejarEditar(poi) {
        try {
            localStorage.setItem("poiEditar", JSON.stringify(poi))
            navegar("/EditarPOI")
        } catch (error) {
            console.error("Error guardando referencia del POI:", error)
        }
    }

    // Render principal del listado de POIs y solicitudes
    return (
        <div className="pois">
            <h2 className="pois__title">Mis puntos turísticos</h2>

            {cargando && <p className="pois__loading">Cargando datos...</p>}
            {mensajeError && <p className="pois__error">{mensajeError}</p>}

            <div className="pois__container">
                {/* POIs aceptados */}
                {listaPOIs.length > 0 && (
                    <div className="pois__section pois__section--accepted">
                        <h3 className="pois__subtitle">POIs aceptados</h3>
                        <ul className="pois__list">
                            {listaPOIs.map(function (poi) {
                                return (
                                    <li key={poi.id} className="pois__item">
                                        <strong className="pois__name">{poi.nombre}</strong>
                                        <p className="pois__description">{poi.descripcion}</p>
                                        {poi.ubicacion && (
                                            <small className="pois__location">
                                                {poi.ubicacion.lat}, {poi.ubicacion.lng}
                                            </small>
                                        )}
                                        <div className="pois__actions">
                                            <button
                                                className="pois__btn pois__btn--edit"
                                                onClick={function () { manejarEditar(poi) }}
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}

                {/* Mensaje si no hay POIs aceptados */}
                {listaPOIs.length === 0 && !cargando && (
                    <p className="pois__message">No tienes POIs aceptados todavía.</p>
                )}

                {/* Solicitudes en revisión */}
                {listaSolicitudes.length > 0 && (
                    <div className="pois__section pois__section--pending">
                        <h3 className="pois__subtitle">Solicitudes en revisión</h3>
                        <ul className="pois__list">
                            {listaSolicitudes.map(function (solicitud) {
                                return (
                                    <li key={solicitud.id} className="pois__item pois__item--pending">
                                        <strong className="pois__name">{solicitud.nombre}</strong>
                                        <p className="pois__description">{solicitud.descripcion}</p>
                                        <small className="pois__status">Estado: En revisión</small>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* Botón para solicitar nuevo punto turístico */}
            <button
                className="pois__btn pois__btn--new"
                onClick={function () { navegar("/NuevoPOI") }}
            >
                Solicitar nuevo punto turístico
            </button>
        </div>
    )
}

export default POIs