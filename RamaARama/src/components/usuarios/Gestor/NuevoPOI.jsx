import { useState, useEffect } from 'react'
import { crearElemento, obtenerElementos } from '../../../api/Crud'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../../../styles/NuevoPOI.css'

// Configurar íconos de Leaflet (evita ícono roto en producción y HMR)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

if (L?.Icon?.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl
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
    className: 'leaflet-icono-verde'
})

function NuevoPOI() {
    // Campos principales
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')

    // Ubicación del usuario
    const [ubicacion, setUbicacion] = useState({ lat: null, lng: null })
    const [cargandoUbicacion, setCargandoUbicacion] = useState(true)
    const [errorUbicacion, setErrorUbicacion] = useState('')

    // Categorías (dinámicas desde API: array de {grupo, items: []})
    const [categoriasData, setCategoriasData] = useState([])
    const [categoriasLoading, setCategoriasLoading] = useState(true)
    const [categoriasError, setCategoriasError] = useState('')
    const [categorias, setCategorias] = useState([])
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
    const [mostrarSelectCategoria, setMostrarSelectCategoria] = useState(false)

    // Redes sociales
    const opcionesRedes = [
        { id: 'facebook', nombre: 'Facebook' },
        { id: 'tiktok', nombre: 'TikTok' },
        { id: 'instagram', nombre: 'Instagram' },
        { id: 'web', nombre: 'Sitio Web' },
        { id: 'whatsapp', nombre: 'WhatsApp' }
    ]
    const [redSocialSeleccionada, setRedSocialSeleccionada] = useState('')
    const [linkRed, setLinkRed] = useState('')
    const [redes, setRedes] = useState([])

    // Token y control de solicitud previa
    const [yaSolicito, setYaSolicito] = useState(false)
    const [verificandoSolicitud, setVerificandoSolicitud] = useState(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    // Verificar si el token ya tiene una solicitud previa
    useEffect(() => {
        async function verificarSolicitud() {
            try {
                if (!token) {
                    setYaSolicito(false)
                    return
                }
                const solicitudes = await obtenerElementos('solicitudPOIs', 3)
                // Soporta array de solicitudes [{token, ...}]
                if (Array.isArray(solicitudes)) {
                    const existe = solicitudes.some((s) => String(s.token) === String(token))
                    setYaSolicito(existe)
                } else {
                    setYaSolicito(false)
                }
            } catch (err) {
                console.error('Error verificando solicitudes previas:', err)
                setYaSolicito(false)
            } finally {
                setVerificandoSolicitud(false)
            }
        }
        verificarSolicitud()
    }, [token])

    // Obtener ubicación real del usuario
    useEffect(() => {
        setCargandoUbicacion(true)
        setErrorUbicacion('')

        if (!navigator.geolocation) {
            setErrorUbicacion('La geolocalización no está disponible en este navegador.')
            setCargandoUbicacion(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUbicacion({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                setCargandoUbicacion(false)
            },
            (err) => {
                console.error('Error obteniendo ubicación:', err)
                setErrorUbicacion('No se pudo obtener la ubicación. Revisa permisos o configuración.')
                setCargandoUbicacion(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }, [])

    // Cargar categorías desde API: obtenerElementos('categoriasTuristicas', 3)
    useEffect(() => {
        async function cargarCategorias() {
            setCategoriasLoading(true)
            setCategoriasError('')
            try {
                const data = await obtenerElementos('categoriasTuristicas', 3)
                // Tu API devuelve directamente el array de grupos
                if (Array.isArray(data)) {
                    setCategoriasData(data)
                } else if (data && Array.isArray(data.categoriasTuristicas)) {
                    setCategoriasData(data.categoriasTuristicas)
                } else {
                    setCategoriasError('No se pudo interpretar la lista de categorías.')
                }
            } catch (err) {
                console.error('Error cargando categorías:', err)
                setCategoriasError('No se pudieron cargar las categorías.')
            } finally {
                setCategoriasLoading(false)
            }
        }
        cargarCategorias()
    }, [])

    // Categorías: agregar y eliminar
    const agregarCategoria = () => {
        const cat = (categoriaSeleccionada || '').trim()
        if (!cat) return
        if (categorias.includes(cat)) return
        setCategorias((prev) => [...prev, cat])
        setCategoriaSeleccionada('')
        setMostrarSelectCategoria(false)
    }

    const eliminarCategoria = (index) => {
        setCategorias((prev) => prev.filter((_, i) => i !== index))
    }

    // Redes sociales: agregar y eliminar
    const agregarRed = () => {
        const tipo = (redSocialSeleccionada || '').trim()
        const link = (linkRed || '').trim()
        if (!tipo || !link) return
        setRedes((prev) => [...prev, { tipo, link }])
        setRedSocialSeleccionada('')
        setLinkRed('')
    }

    const eliminarRed = (index) => {
        setRedes((prev) => prev.filter((_, i) => i !== index))
    }

    // Envío: crearElemento('solicitudPOIs', datos, 3)
    const manejarEnvio = async (e) => {
        e.preventDefault()

        if (!nombre.trim()) {
            alert('El nombre es obligatorio')
            return
        }
        if (!ubicacion.lat || !ubicacion.lng) {
            alert('No se pudo obtener la ubicación del usuario')
            return
        }

        const datos = {
            token: token || null, // se guarda el token si existe
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            ubicacion: { lat: ubicacion.lat, lng: ubicacion.lng },
            categorias,
            redes
        }

        try {
            await crearElemento('solicitudPOIs', datos, 3)
            console.log('Solicitud de POI enviada:', datos)
            // Limpiar y bloquear formulario
            setNombre('')
            setDescripcion('')
            setCategorias([])
            setRedes([])
            setYaSolicito(true)
            alert('Solicitud de POI enviada correctamente')
        } catch (error) {
            console.error('Error guardando la solicitud de POI:', error)
            alert('Ocurrió un error al guardar la solicitud de POI')
        }
    }

    // Estados de verificación: mostrar mensajes adecuados
    if (verificandoSolicitud) {
        return (
            <div className="nuevo-poi-form">
                <h2>Verificando tu solicitud...</h2>
                <p>Por favor, espera un momento.</p>
            </div>
        )
    }

    if (yaSolicito) {
        return (
            <div className="nuevo-poi-form">
                <h2>Solicitud ya enviada</h2>
                <p>
                    Ya has enviado una solicitud de POI con tu cuenta. Debes esperar a que sea revisada antes de
                    enviar otra.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={manejarEnvio} className="nuevo-poi-form">
            <h2>Crear Punto de Interés (POI)</h2>

            <div className="form-row">
                <label>Nombre del POI</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Mirador de San José"
                />
            </div>

            <div className="form-row">
                <label>Descripción</label>
                <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el lugar..."
                    rows={4}
                />
            </div>

            <div className="form-row">
                <label>Ubicación detectada</label>
                {cargandoUbicacion && <p>Obteniendo ubicación...</p>}
                {!cargandoUbicacion && errorUbicacion && <p className="error">{errorUbicacion}</p>}
                {!cargandoUbicacion && !errorUbicacion && ubicacion.lat && ubicacion.lng && (
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
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={[ubicacion.lat, ubicacion.lng]}
                        draggable={true}
                        icon={iconoVerde}
                        eventHandlers={{
                            dragend: (e) => {
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

                {categoriasLoading && <p>Cargando categorías…</p>}
                {!categoriasLoading && categoriasError && <p className="error">{categoriasError}</p>}

                {!categoriasLoading && !categoriasError && (
                    <>
                        <div className="inline">
                            <button type="button" onClick={() => setMostrarSelectCategoria(true)}>
                                Agregar categoría
                            </button>
                        </div>

                        {mostrarSelectCategoria && (
                            <div className="inline gap">
                                <select
                                    value={categoriaSeleccionada}
                                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                >
                                    <option value="">Seleccione categoría</option>
                                    {categoriasData.map((grupo) => (
                                        <optgroup key={grupo.grupo} label={grupo.grupo}>
                                            {grupo.items.map((item) => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button type="button" onClick={agregarCategoria}>Agregar</button>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => { setCategoriaSeleccionada(''); setMostrarSelectCategoria(false) }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        {categorias.length > 0 && (
                            <ul className="pill-list">
                                {categorias.map((c, index) => (
                                    <li key={`${c}-${index}`} className="pill">
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
                    </>
                )}
            </div>

            <div className="form-row">
                <label>Redes sociales</label>
                <div className="inline gap">
                    <select
                        value={redSocialSeleccionada}
                        onChange={(e) => setRedSocialSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione red social</option>
                        {opcionesRedes.map((red) => (
                            <option key={red.id} value={red.nombre}>{red.nombre}</option>
                        ))}
                    </select>
                    <input
                        type="url"
                        placeholder="Link de la red social"
                        value={linkRed}
                        onChange={(e) => setLinkRed(e.target.value)}
                    />
                    <button type="button" onClick={agregarRed}>Agregar</button>
                </div>

                {redes.length > 0 && (
                    <ul className="pill-list">
                        {redes.map((r, index) => (
                            <li key={`${r.tipo}-${index}`} className="pill">
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

            <div className="actions">
                <button type="submit" disabled={cargandoUbicacion}>
                    Enviar solicitud de POI
                </button>
            </div>
        </form>
    )
}

export default NuevoPOI
