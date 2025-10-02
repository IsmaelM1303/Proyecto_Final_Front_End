import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { crearElemento, obtenerElementos } from "../../../api/Crud"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../../../styles/NuevoPOI.css"
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"
import TimeLineEditor from "./TimelineEditor"

// Configuración global de iconos para Leaflet
if (L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl,
        iconUrl: iconUrl,
        shadowUrl: shadowUrl
    })
}

// Icono personalizado para el marcador principal
const iconoVerde = new L.Icon({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: "leaflet-icono-verde"
})

/**
 * Componente EditPOI
 * Permite editar un Punto de Interés (POI) existente.
 * Inicializa los datos del POI desde localStorage y los muestra en el formulario.
 * Permite modificar nombre, descripción, ubicación (con marcador draggable en el mapa), categorías turísticas, redes sociales y línea de tiempo.
 * Las categorías se cargan desde la base simulada y pueden agregarse/eliminarse dinámicamente.
 * Las redes sociales se agregan como pares tipo/link y pueden eliminarse.
 * La línea de tiempo se edita mediante el componente TimeLineEditor.
 * Al guardar, valida los datos y envía la solicitud de edición a la base simulada.
 * Si ya existe una solicitud pendiente para el usuario, muestra un aviso y bloquea la edición.
 */
function EditPOI() {
    const navegar = useNavigate()

    // Estados para los datos del POI
    const [idPOI, setIdPOI] = useState("")
    const [nombre, setNombre] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null })

    // Estados para categorías turísticas
    const [categorias, setCategorias] = useState([])
    const [categoriasData, setCategoriasData] = useState([])
    const [categoriasCargando, setCategoriasCargando] = useState(true)
    const [categoriasError, setCategoriasError] = useState("")
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
    const [mostrarSelectCategoria, setMostrarSelectCategoria] = useState(false)

    // Estados para redes sociales
    const [redes, setRedes] = useState([])
    const [redSocialSeleccionada, setRedSocialSeleccionada] = useState("")
    const [linkRed, setLinkRed] = useState("")

    // Estados para mensajes de error y aviso
    const [mensajeError, setMensajeError] = useState("")
    const [mensajeAviso, setMensajeAviso] = useState("")

    // Estado para la línea de tiempo
    const [lineaTiempo, setLineaTiempo] = useState([])

    // Opciones de redes sociales disponibles
    const opcionesRedes = [
        { id: "facebook", nombre: "Facebook" },
        { id: "tiktok", nombre: "TikTok" },
        { id: "instagram", nombre: "Instagram" },
        { id: "web", nombre: "Sitio Web" },
        { id: "whatsapp", nombre: "WhatsApp" }
    ]

    // Token de usuario autenticado
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    // Efecto para inicializar el formulario con los datos del POI a editar
    useEffect(() => {
        async function inicializar() {
            try {
                // Obtiene el POI a editar desde localStorage
                const referencia = localStorage.getItem("poiEditar")
                if (referencia) {
                    const objetoPOI = JSON.parse(referencia)

                    setIdPOI(objetoPOI?.id || "")
                    setNombre(objetoPOI?.nombre || "")
                    setDescripcion(objetoPOI?.descripcion || "")
                    setUbicacion(
                        objetoPOI?.ubicacion &&
                        typeof objetoPOI.ubicacion.lat === "number" &&
                        typeof objetoPOI.ubicacion.lng === "number"
                            ? { lat: objetoPOI.ubicacion.lat, lng: objetoPOI.ubicacion.lng }
                            : { lat: null, lng: null }
                    )
                    setCategorias(Array.isArray(objetoPOI?.categorias) ? objetoPOI.categorias : [])
                    setRedes(Array.isArray(objetoPOI?.redes) ? objetoPOI.redes : [])
                    setLineaTiempo(Array.isArray(objetoPOI?.lineaTiempo) ? objetoPOI.lineaTiempo : [])

                    // Verifica si ya existe una solicitud pendiente para este usuario
                    const solicitudes = await obtenerElementos("solicitudPOIs", 3)
                    if (Array.isArray(solicitudes)) {
                        const existePorToken = solicitudes.some(s => String(s.token) === String(token))
                        if (existePorToken) {
                            setMensajeAviso("Ya se está editando un elemento con tu cuenta, por favor espera aprobación")
                            return
                        }
                    }
                } else {
                    setMensajeError("No se encontró referencia del POI a editar.")
                }
            } catch (error) {
                console.error("Error inicializando EditPOI:", error)
                setMensajeError("Error al cargar el POI.")
            }
        }
        inicializar()
    }, [token])

    // Efecto para cargar las categorías turísticas disponibles
    useEffect(() => {
        async function cargarCategorias() {
            setCategoriasCargando(true)
            setCategoriasError("")
            try {
                const data = await obtenerElementos("categoriasTuristicas", 3)
                if (Array.isArray(data)) {
                    setCategoriasData(data)
                } else if (data && Array.isArray(data.categoriasTuristicas)) {
                    setCategoriasData(data.categoriasTuristicas)
                } else {
                    setCategoriasError("No se pudo interpretar la lista de categorías.")
                }
            } catch (err) {
                console.error("Error cargando categorías:", err)
                setCategoriasError("No se pudieron cargar las categorías.")
            } finally {
                setCategoriasCargando(false)
            }
        }
        cargarCategorias()
    }, [])

    // Agrega una categoría seleccionada al POI
    function agregarCategoria() {
        const categoria = (categoriaSeleccionada || "").trim()
        if (categoria === "" || categorias.includes(categoria)) {
            return
        }
        setCategorias([...categorias, categoria])
        setCategoriaSeleccionada("")
        setMostrarSelectCategoria(false)
    }

    // Elimina una categoría del POI
    function eliminarCategoria(indice) {
        setCategorias(categorias.filter((_, i) => i !== indice))
    }

    // Agrega una red social al POI
    function agregarRed() {
        const tipo = (redSocialSeleccionada || "").trim()
        const link = (linkRed || "").trim()
        if (tipo === "" || link === "") {
            return
        }
        setRedes([...redes, { tipo, link }])
        setRedSocialSeleccionada("")
        setLinkRed("")
    }

    // Elimina una red social del POI
    function eliminarRed(indice) {
        setRedes(redes.filter((_, i) => i !== indice))
    }

    // Maneja el guardado de la edición del POI
    async function manejarGuardar(evento) {
        evento.preventDefault()

        // Validaciones básicas
        if (!nombre.trim()) {
            alert("El nombre es obligatorio")
            return
        }
        if (!ubicacion.lat || !ubicacion.lng) {
            alert("Debe seleccionar una ubicación en el mapa")
            return
        }

        try {
            // Verifica si ya existe una solicitud pendiente para este usuario
            const solicitudes = await obtenerElementos("solicitudPOIs", 3)
            if (Array.isArray(solicitudes)) {
                const existePorToken = solicitudes.some(s => String(s.token) === String(token))
                if (existePorToken) {
                    setMensajeAviso("Ya se está editando un elemento con tu cuenta, por favor espera aprobación")
                    return
                }
            }

            // Construye el objeto de datos editados
            const datosEditados = {
                id: idPOI,
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                ubicacion: { lat: ubicacion.lat, lng: ubicacion.lng },
                categorias,
                redes,
                lineaTiempo,
                token
            }

            // Envía la solicitud de edición a la base simulada
            await crearElemento("solicitudPOIs", datosEditados, 3)
            alert("Solicitud de edición enviada correctamente")
            navegar("/Perfil")
        } catch (error) {
            console.error("Error guardando cambios:", error)
            setMensajeError("No se pudieron guardar los cambios.")
        }
    }

    // Renderiza mensajes de error o aviso si corresponden
    if (mensajeError) {
        return (
            <div className="nuevo-poi-form">
                <h2>Error</h2>
                <p className="error">{mensajeError}</p>
            </div>
        )
    }

    if (mensajeAviso) {
        return (
            <div className="nuevo-poi-form nuevo-poi-form--status nuevo-poi-form--notice">
                <h2 className="status-title">Aviso</h2>
                <p className="status-message">{mensajeAviso}</p>
            </div>
        )
    }

    // Render principal del formulario de edición
    return (
        <form onSubmit={manejarGuardar} className="nuevo-poi-form">
            <h2>Editar Punto de Interés (POI)</h2>

            {/* Campo para el nombre del POI */}
            <div className="form-row">
                <label>Nombre del POI</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Centro Cívico por la Paz"
                />
            </div>

            {/* Campo para la descripción */}
            <div className="form-row">
                <label>Descripción</label>
                <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el lugar..."
                    rows={4}
                />
            </div>

            {/* Muestra la ubicación actual */}
            <div className="form-row">
                <label>Ubicación actual</label>
                {ubicacion.lat && ubicacion.lng && (
                    <p className="coords">{ubicacion.lat}, {ubicacion.lng}</p>
                )}
            </div>

            {/* Mapa interactivo para ajustar la ubicación */}
            {ubicacion.lat && ubicacion.lng && (
                <MapContainer
                    center={[ubicacion.lat, ubicacion.lng]}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="mapa-poi"
                >
                    <TileLayer
                        attribution="© OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={[ubicacion.lat, ubicacion.lng]}
                        draggable={true}
                        icon={iconoVerde}
                        eventHandlers={{
                            dragend: function (e) {
                                const marker = e.target
                                const pos = marker.getLatLng()
                                setUbicacion({ lat: pos.lat, lng: pos.lng })
                            }
                        }}
                    >
                        <Popup>Mueve este marcador para ajustar la ubicación</Popup>
                    </Marker>
                </MapContainer>
            )}

            {/* Sección de categorías turísticas */}
            <div className="form-row">
                <label>Categorías turísticas</label>
                {categoriasCargando && <p>Cargando categorías…</p>}
                {!categoriasCargando && categoriasError && <p className="error">{categoriasError}</p>}
                {!categoriasCargando && !categoriasError && (
                    <div>
                        <div className="inline">
                            <button type="button" onClick={() => setMostrarSelectCategoria(true)}>
                                Agregar categoría
                            </button>
                        </div>
                        {mostrarSelectCategoria && (
                            <div className="inline gap">
                                <select
                                    value={categoriaSeleccionada}
                                    onChange={e => setCategoriaSeleccionada(e.target.value)}
                                >
                                    <option value="">Seleccione categoría</option>
                                    {categoriasData.map(grupo => (
                                        <optgroup key={grupo.grupo} label={grupo.grupo}>
                                            {grupo.items.map(item => (
                                                <option key={grupo.grupo + "-" + item} value={item}>{item}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button type="button" onClick={agregarCategoria}>Agregar</button>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => {
                                        setCategoriaSeleccionada("")
                                        setMostrarSelectCategoria(false)
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                        {categorias.length > 0 && (
                            <ul className="pill-list">
                                {categorias.map((c, index) => (
                                    <li key={c + "-" + index} className="pill">
                                        {c}
                                        <button
                                            type="button"
                                            className="pill-remove"
                                            onClick={() => eliminarCategoria(index)}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Sección de redes sociales */}
            <div className="form-row">
                <label>Redes sociales</label>
                <div className="inline gap">
                    <select
                        value={redSocialSeleccionada}
                        onChange={e => setRedSocialSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione red social</option>
                        {opcionesRedes.map(red => (
                            <option key={red.id} value={red.nombre}>{red.nombre}</option>
                        ))}
                    </select>
                    <input
                        type="url"
                        placeholder="Link de la red social"
                        value={linkRed}
                        onChange={e => setLinkRed(e.target.value)}
                    />
                    <button type="button" onClick={agregarRed}>Agregar</button>
                </div>
                {redes.length > 0 && (
                    <ul className="pill-list">
                        {redes.map((r, index) => (
                            <li key={r.tipo + "-" + index} className="pill">
                                {r.tipo}: {r.link}
                                <button
                                    type="button"
                                    className="pill-remove"
                                    onClick={() => eliminarRed(index)}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Sección para editar la línea de tiempo */}
            <div className="form-row">
                <label>Línea de tiempo</label>
                <TimeLineEditor lineaTiempo={lineaTiempo} setLineaTiempo={setLineaTiempo} />
            </div>

            {/* Botón para guardar cambios */}
            <div className="actions">
                <button type="submit">
                    Guardar cambios del POI
                </button>
            </div>
        </form>
    )
}

export default EditPOI