import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../../api/Crud"
import "../../../styles/NuevoPOI.css"

function POIs() {
    const navigate = useNavigate()

    const [pois, setPois] = useState([])
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    useEffect(() => {
        async function cargarDatos() {
            setLoading(true)
            setError("")
            try {
                // Obtener POIs aceptados
                const dataPOIs = await obtenerElementos("POIs", 3)
                if (Array.isArray(dataPOIs)) {
                    setPois(dataPOIs)
                }

                // Obtener solicitudes de POIs
                const dataSolicitudes = await obtenerElementos("solicitudPOIs", 3)
                if (Array.isArray(dataSolicitudes)) {
                    // Si hay token, filtrar solo las del usuario
                    if (token) {
                        const propias = dataSolicitudes.filter(s => String(s.token) === String(token))
                        setSolicitudes(propias)
                    } else {
                        setSolicitudes(dataSolicitudes)
                    }
                }
            } catch (err) {
                console.error("Error cargando POIs:", err)
                setError("No se pudieron cargar los puntos turísticos.")
            } finally {
                setLoading(false)
            }
        }
        cargarDatos()
    }, [token])

    return (
        <div>
            <h2>Mis puntos turísticos</h2>

            {loading && <p>Cargando datos...</p>}
            {error && <p className="error">{error}</p>}

            <div className="contenedor">
                {/* POIs aceptados */}
                {pois.length > 0 ? (
                    <div>
                        <h3>POIs aceptados</h3>
                        <ul className="poi-list">
                            {pois.map((poi) => (
                                <li key={poi.id} className="poi-item">
                                    <strong>{poi.nombre}</strong>
                                    <p>{poi.descripcion}</p>
                                    {poi.ubicacion && (
                                        <small>
                                            {poi.ubicacion.lat}, {poi.ubicacion.lng}
                                        </small>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    !loading && <p>No tienes POIs aceptados todavía.</p>
                )}

                {/* Solicitudes pendientes */}
                {solicitudes.length > 0 && (
                    <div>
                        <h3>Solicitudes en revisión</h3>
                        <ul className="poi-list">
                            {solicitudes.map((sol) => (
                                <li key={sol.id} className="poi-item pending">
                                    <strong>{sol.nombre}</strong>
                                    <p>{sol.descripcion}</p>
                                    <small>Estado: En revisión</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Botón para nueva solicitud */}
            <button onClick={() => navigate("/NuevoPOI")}>
                Solicitar nuevo punto turístico
            </button>
        </div>
    )
}

export default POIs
