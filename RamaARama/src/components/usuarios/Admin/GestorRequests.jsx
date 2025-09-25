import { useState, useEffect } from 'react'
import {
    obtenerElementos,
    actualizarElemento,
    eliminarElemento,
    crearElemento
} from '../../../api/Crud'
import emailjs from '@emailjs/browser'

function GestorRequests() {
    const [filtro, setFiltro] = useState('') // 'admin' | 'gestor' | 'poi'
    const [datos, setDatos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // EmailJS
    const serviceId = 'RamaARama'
    const templateId = 'template_9ymo2cf'
    const publicKey = 'Mlos1g8OYYwn0hzqv'

    useEffect(() => {
        cargarDatos()
    }, [filtro])

    async function cargarDatos() {
        setError('')
        setDatos([])
        if (!filtro) {
            return
        }

        setLoading(true)

        try {
            let endpoint = ''
            let server = 1

            if (filtro === 'admin') {
                endpoint = 'requestAdmins'
            } else if (filtro === 'gestor') {
                endpoint = 'requestGestores'
            } else if (filtro === 'poi') {
                endpoint = 'solicitudPOIs'
                server = 3
            }

            if (endpoint) {
                const resultado = await obtenerElementos(endpoint, server)
                if (Array.isArray(resultado)) {
                    setDatos(resultado)
                } else {
                    setDatos([])
                }
            }
        } catch (err) {
            console.error('Error cargando datos:', err)
            setError('No se pudieron cargar las solicitudes.')
        } finally {
            setLoading(false)
        }
    }

    // Helpers usuarios (server 1)
    async function obtenerUsuarios() {
        try {
            const usuarios = await obtenerElementos('usuarios', 1)
            if (Array.isArray(usuarios)) {
                return usuarios
            }
            return []
        } catch {
            return []
        }
    }

    async function obtenerUsuarioPorId(id) {
        const usuarios = await obtenerUsuarios()
        for (let i = 0; i < usuarios.length; i++) {
            const u = usuarios[i]
            if (String(u.id) === String(id)) {
                return u
            }
        }
        return null
    }

    async function obtenerCorreoUsuario(idUsuario) {
        const usuario = await obtenerUsuarioPorId(idUsuario)
        if (usuario && usuario.correo) {
            return usuario.correo
        }
        return null
    }

    async function obtenerNombreUsuarioActual() {
        const token = localStorage.getItem('token')
        if (!token) {
            return null
        }
        const usuarioActual = await obtenerUsuarioPorId(token)
        if (usuarioActual && usuarioActual.nombre) {
            return usuarioActual.nombre
        }
        return null
    }

    // Email personalizado por tipo
    async function enviarCorreoSolicitud({ toEmail, nombreDestinatario, tipo, estado, item }) {
        if (!toEmail) {
            return
        }

        const nombreAccion = await obtenerNombreUsuarioActual()
        let actor = 'un miembro del equipo'
        if (nombreAccion) {
            actor = nombreAccion
        }

        let asuntoTipo = ''
        let mensaje = ''

        if (tipo === 'Administrador') {
            asuntoTipo = 'Solicitud de Administrador'
            if (estado === 'aprobada') {
                mensaje = 'Tu solicitud para convertirte en Administrador ha sido aprobada por ' + actor + '. ¡Bienvenido/a al equipo!'
            } else {
                mensaje = 'Tu solicitud para convertirte en Administrador ha sido rechazada por ' + actor + '. Gracias por tu interés.'
            }
        } else if (tipo === 'Gestor') {
            asuntoTipo = 'Solicitud de Gestor'
            if (estado === 'aprobada') {
                mensaje = 'Tu solicitud para convertirte en Gestor ha sido aprobada por ' + actor + '. ¡Bienvenido/a al equipo!'
            } else {
                mensaje = 'Tu solicitud para convertirte en Gestor ha sido rechazada por ' + actor + '. Gracias por tu interés.'
            }
        } else if (tipo === 'Punto de Interés') {
            let nombrePOI = 'POI'
            if (item && item.nombre) {
                nombrePOI = item.nombre
            }
            asuntoTipo = 'Solicitud de Punto de Interés: ' + nombrePOI
            if (estado === 'aprobada') {
                mensaje = 'Tu solicitud para publicar el Punto de Interés "' + nombrePOI + '" ha sido aprobada por ' + actor + '. Ya está disponible en la plataforma.'
            } else {
                mensaje = 'Tu solicitud para el Punto de Interés "' + nombrePOI + '" ha sido rechazada por ' + actor + '. Gracias por tu aporte.'
            }
        }

        const nombrePara = nombreDestinatario && nombreDestinatario.length > 0 ? nombreDestinatario : 'Usuario'

        const params = {
            name: nombrePara,
            to_email: toEmail,
            request_type: asuntoTipo,
            status: estado,
            time: new Date().toLocaleString(),
            message: mensaje
        }

        try {
            await emailjs.send(serviceId, templateId, params, publicKey)
            console.log('Correo enviado a ' + toEmail)
        } catch (error) {
            console.error('Error al enviar correo:', error)
        }
    }

    // Aceptar solicitudes de cuenta
    async function aceptarSolicitudCuenta(item) {
        const nuevosDatos = { ...item }
        if (filtro === 'admin') {
            nuevosDatos.tipoCuenta = 'turista admin'
        } else {
            nuevosDatos.tipoCuenta = 'turista gestor'
        }

        const actualizado = await actualizarElemento('usuarios', item.id, nuevosDatos, 1)
        if (!actualizado) {
            alert('Error al aceptar la solicitud')
            return
        }

        const correoUsuario = await obtenerCorreoUsuario(item.id)
        let tipoSolicitud = ''
        if (filtro === 'admin') {
            tipoSolicitud = 'Administrador'
        } else {
            tipoSolicitud = 'Gestor'
        }

        await enviarCorreoSolicitud({
            toEmail: correoUsuario,
            nombreDestinatario: item.nombre,
            tipo: tipoSolicitud,
            estado: 'aprobada',
            item
        })

        let endpoint = 'requestGestores'
        if (filtro === 'admin') {
            endpoint = 'requestAdmins'
        }

        await eliminarElemento(endpoint, item.id, 1)
        setDatos((prev) => prev.filter((req) => req.id !== item.id))
        alert('Solicitud de ' + tipoSolicitud + ' aceptada para usuario ' + item.id)
    }

    async function negarSolicitudCuenta(item) {
        const correoUsuario = await obtenerCorreoUsuario(item.id)

        let tipoSolicitud = 'Gestor'
        if (filtro === 'admin') {
            tipoSolicitud = 'Administrador'
        }

        await enviarCorreoSolicitud({
            toEmail: correoUsuario,
            nombreDestinatario: item.nombre,
            tipo: tipoSolicitud,
            estado: 'rechazada',
            item
        })

        let endpoint = 'requestGestores'
        if (filtro === 'admin') {
            endpoint = 'requestAdmins'
        }

        await eliminarElemento(endpoint, item.id, 1)
        setDatos((prev) => prev.filter((req) => req.id !== item.id))
        alert('Solicitud de ' + tipoSolicitud + ' negada para usuario ' + item.id)
    }

    // Aceptar/rechazar solicitudes de POI (server 3)
    async function aceptarSolicitudPOI(item) {
        try {
            const nuevoPOI = {
                nombre: item.nombre,
                descripcion: item.descripcion,
                ubicacion: item.ubicacion,
                categorias: Array.isArray(item.categorias) ? item.categorias : [],
                redes: Array.isArray(item.redes) ? item.redes : [],
                token: item.token ? item.token : null
            }

            await crearElemento('POIs', nuevoPOI, 3)

            let correoUsuario = null
            if (item && item.token) {
                const usuario = await obtenerUsuarioPorId(item.token)
                if (usuario && usuario.correo) {
                    correoUsuario = usuario.correo
                }
            }

            await enviarCorreoSolicitud({
                toEmail: correoUsuario,
                nombreDestinatario: item.nombre,
                tipo: 'Punto de Interés',
                estado: 'aprobada',
                item
            })

            await eliminarElemento('solicitudPOIs', item.id, 3)
            setDatos((prev) => prev.filter((req) => req.id !== item.id))
            alert('Solicitud de POI aceptada: ' + (item.nombre || 'POI'))
        } catch (err) {
            console.error('Error aceptando solicitud de POI:', err)
            alert('Error al aceptar la solicitud de POI')
        }
    }

    async function negarSolicitudPOI(item) {
        let correoUsuario = null
        if (item && item.token) {
            const usuario = await obtenerUsuarioPorId(item.token)
            if (usuario && usuario.correo) {
                correoUsuario = usuario.correo
            }
        }

        await enviarCorreoSolicitud({
            toEmail: correoUsuario,
            nombreDestinatario: item.nombre,
            tipo: 'Punto de Interés',
            estado: 'rechazada',
            item
        })

        await eliminarElemento('solicitudPOIs', item.id, 3)
        setDatos((prev) => prev.filter((req) => req.id !== item.id))
        alert('Solicitud de POI negada: ' + (item.nombre || 'POI'))
    }

    // Dispatcher
    async function aceptarSolicitud(item) {
        if (filtro === 'admin') {
            await aceptarSolicitudCuenta(item)
            return
        }
        if (filtro === 'gestor') {
            await aceptarSolicitudCuenta(item)
            return
        }
        if (filtro === 'poi') {
            await aceptarSolicitudPOI(item)
            return
        }
    }

    async function negarSolicitud(item) {
        if (filtro === 'admin') {
            await negarSolicitudCuenta(item)
            return
        }
        if (filtro === 'gestor') {
            await negarSolicitudCuenta(item)
            return
        }
        if (filtro === 'poi') {
            await negarSolicitudPOI(item)
            return
        }
    }

    // Mensajes
    let mensaje = ''
    if (!filtro) {
        mensaje = 'Selecciona un filtro para ver solicitudes'
    } else {
        if (!loading && datos.length === 0) {
            mensaje = 'No hay solicitudes para este filtro'
        }
    }

    // Render bloques sin ternarios
    let listadoSolicitudes = null
    if (datos.length > 0) {
        const itemsRenderizados = datos.map((item, index) => {
            let contenido = null

            if (filtro === 'poi') {
                const categoriasRender =
                    item.categorias && Array.isArray(item.categorias) && item.categorias.length > 0
                        ? (
                            <div>
                                <strong>Categorías:</strong>
                                <ul>
                                    {item.categorias.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        )
                        : null

                const redesRender =
                    item.redes && Array.isArray(item.redes) && item.redes.length > 0
                        ? (
                            <div>
                                <strong>Redes:</strong>
                                <ul>
                                    {item.redes.map((r, i) => <li key={i}>{r.tipo}: {r.link}</li>)}
                                </ul>
                            </div>
                        )
                        : null

                contenido = (
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p><strong>ID Solicitud:</strong> {item.id}</p>
                        <p><strong>Nombre POI:</strong> {item.nombre}</p>
                        <p><strong>Descripción:</strong> {item.descripcion}</p>
                        {item.ubicacion && item.ubicacion.lat && item.ubicacion.lng && (
                            <p><strong>Ubicación:</strong> {item.ubicacion.lat}, {item.ubicacion.lng}</p>
                        )}
                        {categoriasRender}
                        {redesRender}
                        {item.token && <p><strong>ID Usuario (token):</strong> {item.token}</p>}

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => aceptarSolicitud(item)}>Aceptar</button>
                            <button onClick={() => negarSolicitud(item)}>Negar</button>
                        </div>
                    </div>
                )
            } else {
                const redesRenderCuenta =
                    item.redes && Array.isArray(item.redes) && item.redes.length > 0
                        ? (
                            <div>
                                <strong>Redes:</strong>
                                <ul>
                                    {item.redes.map((r, i) => <li key={i}>{r.tipo}: {r.link}</li>)}
                                </ul>
                            </div>
                        )
                        : null

                contenido = (
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p><strong>ID Usuario:</strong> {item.id}</p>
                        <p><strong>Nombre:</strong> {item.nombre}</p>
                        <p><strong>Provincia:</strong> {item.provinciaResidencia}</p>
                        {item.identificacion && <p><strong>Identificación:</strong> {item.identificacion}</p>}
                        {item.correoSecundario && <p><strong>Correo alterno:</strong> {item.correoSecundario}</p>}
                        {item.telefono && <p><strong>Teléfono:</strong> {item.telefono}</p>}
                        {redesRenderCuenta}

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => aceptarSolicitud(item)}>Aceptar</button>
                            <button onClick={() => negarSolicitud(item)}>Negar</button>
                        </div>
                    </div>
                )
            }

            return <div key={index}>{contenido}</div>
        })

        listadoSolicitudes = <div>{itemsRenderizados}</div>
    }

    return (
        <div>
            <h2>Solicitudes</h2>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setFiltro('admin')}>Ver solicitudes de Administrador</button>
                <button onClick={() => setFiltro('gestor')}>Ver solicitudes de Gestor</button>
                <button onClick={() => setFiltro('poi')}>Ver solicitudes de POIs</button>
            </div>

            {loading && <p>Cargando solicitudes…</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {!loading && mensaje && <p>{mensaje}</p>}

            {listadoSolicitudes}
        </div>
    )
}

export default GestorRequests
