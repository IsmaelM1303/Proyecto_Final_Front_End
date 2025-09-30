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

if (L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl,
        iconUrl: iconUrl,
        shadowUrl: shadowUrl
    })
}

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

function EditPOI() {
    const navegar = useNavigate()

    const [idPOI, setIdPOI] = useState("")
    const [nombre, setNombre] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null })

    const [categorias, setCategorias] = useState([])
    const [categoriasData, setCategoriasData] = useState([])
    const [categoriasCargando, setCategoriasCargando] = useState(true)
    const [categoriasError, setCategoriasError] = useState("")
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
    const [mostrarSelectCategoria, setMostrarSelectCategoria] = useState(false)

    const [redes, setRedes] = useState([])
    const [redSocialSeleccionada, setRedSocialSeleccionada] = useState("")
    const [linkRed, setLinkRed] = useState("")

    const [mensajeError, setMensajeError] = useState("")
    const [mensajeAviso, setMensajeAviso] = useState("")

    const [lineaTiempo, setLineaTiempo] = useState([])

    const opcionesRedes = [
        { id: "facebook", nombre: "Facebook" },
        { id: "tiktok", nombre: "TikTok" },
        { id: "instagram", nombre: "Instagram" },
        { id: "web", nombre: "Sitio Web" },
        { id: "whatsapp", nombre: "WhatsApp" }
    ]

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    useEffect(() => {
        async function inicializar() {
            try {
                const referencia = localStorage.getItem("poiEditar")
                if (referencia) {
                    const objetoPOI = JSON.parse(referencia)

                    if (objetoPOI && objetoPOI.id) {
                        setIdPOI(objetoPOI.id)
                    } else {
                        setIdPOI("")
                    }

                    if (objetoPOI && objetoPOI.nombre) {
                        setNombre(objetoPOI.nombre)
                    } else {
                        setNombre("")
                    }

                    if (objetoPOI && objetoPOI.descripcion) {
                        setDescripcion(objetoPOI.descripcion)
                    } else {
                        setDescripcion("")
                    }

                    if (objetoPOI && objetoPOI.ubicacion && typeof objetoPOI.ubicacion.lat === "number" && typeof objetoPOI.ubicacion.lng === "number") {
                        setUbicacion({ lat: objetoPOI.ubicacion.lat, lng: objetoPOI.ubicacion.lng })
                    } else {
                        setUbicacion({ lat: null, lng: null })
                    }

                    if (objetoPOI && Array.isArray(objetoPOI.categorias)) {
                        setCategorias(objetoPOI.categorias)
                    } else {
                        setCategorias([])
                    }

                    if (objetoPOI && Array.isArray(objetoPOI.redes)) {
                        setRedes(objetoPOI.redes)
                    } else {
                        setRedes([])
                    }

                    if (objetoPOI && Array.isArray(objetoPOI.lineaTiempo)) {
                        setLineaTiempo(objetoPOI.lineaTiempo)
                    } else {
                        setLineaTiempo([])
                    }

                    const solicitudes = await obtenerElementos("solicitudPOIs", 3)
                    if (Array.isArray(solicitudes)) {
                        const existePorToken = solicitudes.some(function (s) {
                            return String(s.token) === String(token)
                        })
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

    useEffect(() => {
        async function cargarCategorias() {
            setCategoriasCargando(true)
            setCategoriasError("")
            try {
                const data = await obtenerElementos("categoriasTuristicas", 3)
                if (Array.isArray(data)) {
                    setCategoriasData(data)
                } else {
                    if (data && Array.isArray(data.categoriasTuristicas)) {
                        setCategoriasData(data.categoriasTuristicas)
                    } else {
                        setCategoriasError("No se pudo interpretar la lista de categorías.")
                    }
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

    function agregarCategoria() {
        const categoria = (categoriaSeleccionada || "").trim()
        if (categoria === "") {
            return
        }
        if (categorias.indexOf(categoria) !== -1) {
            return
        }
        const copia = categorias.slice()
        copia.push(categoria)
        setCategorias(copia)
        setCategoriaSeleccionada("")
        setMostrarSelectCategoria(false)
    }

    function eliminarCategoria(indice) {
        const copia = categorias.filter(function (_, i) { return i !== indice })
        setCategorias(copia)
    }

    function agregarRed() {
        const tipo = (redSocialSeleccionada || "").trim()
        const link = (linkRed || "").trim()
        if (tipo === "" || link === "") {
            return
        }
        const copia = redes.slice()
        copia.push({ tipo: tipo, link: link })
        setRedes(copia)
        setRedSocialSeleccionada("")
        setLinkRed("")
    }

    function eliminarRed(indice) {
        const copia = redes.filter(function (_, i) { return i !== indice })
        setRedes(copia)
    }

    async function manejarGuardar(evento) {
        evento.preventDefault()

        if (!nombre.trim()) {
            alert("El nombre es obligatorio")
            return
        }
        if (!ubicacion.lat || !ubicacion.lng) {
            alert("Debe seleccionar una ubicación en el mapa")
            return
        }

        try {
            const solicitudes = await obtenerElementos("solicitudPOIs", 3)
            if (Array.isArray(solicitudes)) {
                const existePorToken = solicitudes.some(function (s) {
                    return String(s.token) === String(token)
                })
                if (existePorToken) {
                    setMensajeAviso("Ya se está editando un elemento con tu cuenta, por favor espera aprobación")
                    return
                }
            }

            const datosEditados = {
                id: idPOI,
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                ubicacion: { lat: ubicacion.lat, lng: ubicacion.lng },
                categorias: categorias,
                redes: redes,
                lineaTiempo: lineaTiempo,
                token: token
            }

            await crearElemento("solicitudPOIs", datosEditados, 3)
            alert("Solicitud de edición enviada correctamente")
            navegar("/Perfil")
        } catch (error) {
            console.error("Error guardando cambios:", error)
            setMensajeError("No se pudieron guardar los cambios.")
        }
    }

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
            <div className="nuevo-poi-form">
                <h2>Aviso</h2>
                <p>{mensajeAviso}</p>
            </div>
        )
    }

    return (
        <form onSubmit={manejarGuardar} className="nuevo-poi-form">
            <h2>Editar Punto de Interés (POI)</h2>

            <div className="form-row">
                <label>Nombre del POI</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={function (e) { setNombre(e.target.value) }}
                    placeholder="Ej. Centro Cívico por la Paz"
                />
            </div>

            <div className="form-row">
                <label>Descripción</label>
                <textarea
                    value={descripcion}
                    onChange={function (e) { setDescripcion(e.target.value) }}
                    placeholder="Describe brevemente el lugar..."
                    rows={4}
                />
            </div>

            <div className="form-row">
                <label>Ubicación actual</label>
                {ubicacion.lat && ubicacion.lng && (
                    <p className="coords">{ubicacion.lat}, {ubicacion.lng}</p>
                )}
            </div>

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

            <div className="form-row">
                <label>Categorías turísticas</label>

                {categoriasCargando && <p>Cargando categorías…</p>}
                {!categoriasCargando && categoriasError && <p className="error">{categoriasError}</p>}

                {!categoriasCargando && !categoriasError && (
                    <div>
                        <div className="inline">
                            <button type="button" onClick={function () { setMostrarSelectCategoria(true) }}>
                                Agregar categoría
                            </button>
                        </div>

                        {mostrarSelectCategoria && (
                            <div className="inline gap">
                                <select
                                    value={categoriaSeleccionada}
                                    onChange={function (e) { setCategoriaSeleccionada(e.target.value) }}
                                >
                                    <option value="">Seleccione categoría</option>
                                    {categoriasData.map(function (grupo) {
                                        return (
                                            <optgroup key={grupo.grupo} label={grupo.grupo}>
                                                {grupo.items.map(function (item) {
                                                    return (
                                                        <option key={grupo.grupo + "-" + item} value={item}>{item}</option>
                                                    )
                                                })}
                                            </optgroup>
                                        )
                                    })}
                                </select>
                                <button type="button" onClick={agregarCategoria}>Agregar</button>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={function () {
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
                                {categorias.map(function (c, index) {
                                    return (
                                        <li key={c + "-" + index} className="pill">
                                            {c}
                                            <button
                                                type="button"
                                                className="pill-remove"
                                                onClick={function () { eliminarCategoria(index) }}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className="form-row">
                <label>Redes sociales</label>
                <div className="inline gap">
                    <select
                        value={redSocialSeleccionada}
                        onChange={function (e) { setRedSocialSeleccionada(e.target.value) }}
                    >
                        <option value="">Seleccione red social</option>
                        {opcionesRedes.map(function (red) {
                            return (
                                <option key={red.id} value={red.nombre}>{red.nombre}</option>
                            )
                        })}
                    </select>
                    <input
                        type="url"
                        placeholder="Link de la red social"
                        value={linkRed}
                        onChange={function (e) { setLinkRed(e.target.value) }}
                    />
                    <button type="button" onClick={agregarRed}>Agregar</button>
                </div>

                {redes.length > 0 && (
                    <ul className="pill-list">
                        {redes.map(function (r, index) {
                            return (
                                <li key={r.tipo + "-" + index} className="pill">
                                    {r.tipo}: {r.link}
                                    <button
                                        type="button"
                                        className="pill-remove"
                                        onClick={function () { eliminarRed(index) }}
                                    >
                                        ×
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <div className="form-row">
                <label>Línea de tiempo</label>
                <TimeLineEditor lineaTiempo={lineaTiempo} setLineaTiempo={setLineaTiempo} />
            </div>

            <div className="actions">
                <button type="submit">
                    Guardar cambios del POI
                </button>
            </div>
        </form>
    )
}

export default EditPOI
