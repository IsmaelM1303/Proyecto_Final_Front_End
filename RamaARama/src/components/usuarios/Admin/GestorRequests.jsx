import { useState, useEffect } from "react"
import {
    obtenerElementos,
    actualizarElemento,
    eliminarElemento,
    crearElemento
} from "../../../api/Crud"
import emailjs from "@emailjs/browser"
import TimelineSwitcher from "../Gestor/TimelineSwitcher"
import "../../../styles/GestorRequests.css"

function GestorRequests() {
    const [filtro, setFiltro] = useState("")
    const [datos, setDatos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const serviceId = "RamaARama"
    const templateId = "template_9ymo2cf"
    const publicKey = "Mlos1g8OYYwn0hzqv"

    useEffect(function () {
        cargarDatos()
    }, [filtro])

    async function cargarDatos() {
        setError("")
        setDatos([])
        if (!filtro) {
            return
        }

        setLoading(true)
        try {
            let endpoint = ""
            let server = 1

            if (filtro === "admin") {
                endpoint = "requestAdmins"
            } else if (filtro === "gestor") {
                endpoint = "requestGestores"
            } else if (filtro === "poi") {
                endpoint = "solicitudPOIs"
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
            console.error("Error cargando datos:", err)
            setError("No se pudieron cargar las solicitudes.")
        } finally {
            setLoading(false)
        }
    }

    async function obtenerUsuarios() {
        try {
            const usuarios = await obtenerElementos("usuarios", 1)
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
        const token = localStorage.getItem("token")
        if (!token) {
            return null
        }
        const usuarioActual = await obtenerUsuarioPorId(token)
        if (usuarioActual && usuarioActual.nombre) {
            return usuarioActual.nombre
        }
        return null
    }

    async function enviarCorreoSolicitud({ toEmail, nombreDestinatario, tipo, estado, item }) {
        if (!toEmail) {
            return
        }

        const nombreAccion = await obtenerNombreUsuarioActual()
        let actor = "un miembro del equipo"
        if (nombreAccion) {
            actor = nombreAccion
        }

        let asuntoTipo = ""
        let mensaje = ""

        if (tipo === "Administrador") {
            asuntoTipo = "Solicitud de Administrador"
            if (estado === "aprobada") {
                mensaje = "Tu solicitud para convertirte en Administrador ha sido aprobada por " + actor
            } else {
                mensaje = "Tu solicitud para convertirte en Administrador ha sido rechazada por " + actor
            }
        } else if (tipo === "Gestor") {
            asuntoTipo = "Solicitud de Gestor"
            if (estado === "aprobada") {
                mensaje = "Tu solicitud para convertirte en Gestor ha sido aprobada por " + actor
            } else {
                mensaje = "Tu solicitud para convertirte en Gestor ha sido rechazada por " + actor
            }
        } else if (tipo === "Punto de Interés") {
            let nombrePOI = "POI"
            if (item && item.nombre) {
                nombrePOI = item.nombre
            }
            asuntoTipo = "Solicitud de Punto de Interés: " + nombrePOI
            if (estado === "aprobada") {
                mensaje = 'Tu solicitud para publicar el Punto de Interés "' + nombrePOI + '" ha sido aprobada por ' + actor
            } else {
                mensaje = 'Tu solicitud para el Punto de Interés "' + nombrePOI + '" ha sido rechazada por ' + actor
            }
        }

        const nombrePara = nombreDestinatario && nombreDestinatario.length > 0 ? nombreDestinatario : "Usuario"

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
        } catch (error) {
            console.error("Error al enviar correo:", error)
        }
    }

    async function aceptarSolicitudCuenta(item) {
        const nuevosDatos = Object.assign({}, item)
        if (filtro === "admin") {
            nuevosDatos.tipoCuenta = "turista admin"
        } else {
            nuevosDatos.tipoCuenta = "turista gestor"
        }

        const actualizado = await actualizarElemento("usuarios", item.id, nuevosDatos, 1)
        if (!actualizado) {
            alert("Error al aceptar la solicitud")
            return
        }

        const correoUsuario = await obtenerCorreoUsuario(item.id)

        let tipoSolicitud = ""
        if (filtro === "admin") {
            tipoSolicitud = "Administrador"
        } else {
            tipoSolicitud = "Gestor"
        }

        await enviarCorreoSolicitud({
            toEmail: correoUsuario,
            nombreDestinatario: item.nombre,
            tipo: tipoSolicitud,
            estado: "aprobada",
            item
        })

        let endpoint = "requestGestores"
        if (filtro === "admin") {
            endpoint = "requestAdmins"
        }

        await eliminarElemento(endpoint, item.id, 1)
        setDatos(function (prev) { return prev.filter(function (req) { return req.id !== item.id }) })
        alert("Solicitud de " + tipoSolicitud + " aceptada para usuario " + item.id)
    }

    async function negarSolicitudCuenta(item) {
        const correoUsuario = await obtenerCorreoUsuario(item.id)

        let tipoSolicitud = "Gestor"
        if (filtro === "admin") {
            tipoSolicitud = "Administrador"
        }

        await enviarCorreoSolicitud({
            toEmail: correoUsuario,
            nombreDestinatario: item.nombre,
            tipo: tipoSolicitud,
            estado: "rechazada",
            item
        })

        let endpoint = "requestGestores"
        if (filtro === "admin") {
            endpoint = "requestAdmins"
        }

        await eliminarElemento(endpoint, item.id, 1)
        setDatos(function (prev) { return prev.filter(function (req) { return req.id !== item.id }) })
        alert("Solicitud de " + tipoSolicitud + " negada para usuario " + item.id)
    }

    function normalizarLineaTiempo(linea) {
        if (!Array.isArray(linea)) {
            return []
        }
        const salida = []
        for (let i = 0; i < linea.length; i++) {
            const ev = linea[i]

            let year = null
            let month = "01"
            let day = "01"

            if (ev && ev.start_date) {
                if (ev.start_date.year) {
                    year = ev.start_date.year
                }
                if (ev.start_date.month) {
                    month = ev.start_date.month
                }
                if (ev.start_date.day) {
                    day = ev.start_date.day
                }
            } else {
                if (ev && ev.year) {
                    year = ev.year
                }
                if (ev && ev.month) {
                    month = ev.month
                }
                if (ev && ev.day) {
                    day = ev.day
                }
            }

            if (!year) {
                continue
            }

            const fecha = {
                year: String(year),
                month: String(month).padStart(2, "0"),
                day: String(day).padStart(2, "0")
            }

            let headline = "•"
            let body = ""

            if (ev && ev.text && typeof ev.text.headline === "string") {
                const h = ev.text.headline.trim()
                if (h.length > 0) {
                    headline = h
                }
            }

            if (ev && ev.text && typeof ev.text.text === "string") {
                const b = ev.text.text.trim()
                if (b.length > 0) {
                    body = b
                }
            } else {
                if (ev && typeof ev.descripcion === "string") {
                    const b2 = ev.descripcion.trim()
                    if (b2.length > 0) {
                        body = b2
                    }
                }
            }

            let media = undefined
            if (ev && ev.media && typeof ev.media.url === "string") {
                if (ev.media.url.length > 0) {
                    const caption = typeof ev.media.caption === "string" ? ev.media.caption : ""
                    const credit = typeof ev.media.credit === "string" ? ev.media.credit : ""
                    media = { url: ev.media.url, caption: caption, credit: credit }
                }
            }

            salida.push({ start_date: fecha, text: { headline: headline, text: body }, media: media })
        }
        return salida
    }

    async function aceptarSolicitudPOI(item) {
        try {
            const nuevoPOI = {
                nombre: item.nombre,
                descripcion: item.descripcion,
                ubicacion: item.ubicacion,
                categorias: Array.isArray(item.categorias) ? item.categorias : [],
                redes: Array.isArray(item.redes) ? item.redes : [],
                lineaTiempo: normalizarLineaTiempo(Array.isArray(item.lineaTiempo) ? item.lineaTiempo : []),
                token: item.token ? item.token : null
            }

            await crearElemento("POIs", nuevoPOI, 3)

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
                tipo: "Punto de Interés",
                estado: "aprobada",
                item
            })

            await eliminarElemento("solicitudPOIs", item.id, 3)
            setDatos(function (prev) { return prev.filter(function (req) { return req.id !== item.id }) })
            alert("Solicitud de POI aceptada: " + (item.nombre || "POI"))
        } catch (err) {
            console.error("Error aceptando solicitud de POI:", err)
            alert("Error al aceptar la solicitud de POI")
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
            tipo: "Punto de Interés",
            estado: "rechazada",
            item
        })

        await eliminarElemento("solicitudPOIs", item.id, 3)
        setDatos(function (prev) { return prev.filter(function (req) { return req.id !== item.id }) })
        alert("Solicitud de POI negada: " + (item.nombre || "POI"))
    }

    async function aceptarSolicitud(item) {
        if (filtro === "admin") {
            await aceptarSolicitudCuenta(item)
            return
        }
        if (filtro === "gestor") {
            await aceptarSolicitudCuenta(item)
            return
        }
        if (filtro === "poi") {
            await aceptarSolicitudPOI(item)
            return
        }
    }

    async function negarSolicitud(item) {
        if (filtro === "admin") {
            await negarSolicitudCuenta(item)
            return
        }
        if (filtro === "gestor") {
            await negarSolicitudCuenta(item)
            return
        }
        if (filtro === "poi") {
            await negarSolicitudPOI(item)
            return
        }
    }

    let mensaje = ""
    if (!filtro) {
        mensaje = "Selecciona un filtro para ver solicitudes"
    } else {
        if (!loading && datos.length === 0) {
            mensaje = "No hay solicitudes para este filtro"
        }
    }

    let listadoSolicitudes = null
    if (datos.length > 0) {
        const itemsRenderizados = datos.map(function (item, index) {
            let contenido = null

            if (filtro === "poi") {
                let categoriasRender = null
                if (item.categorias && Array.isArray(item.categorias) && item.categorias.length > 0) {
                    categoriasRender = (
                        <div className="gestor-requests__categories">
                            <strong>Categorías:</strong>
                            <ul className="gestor-requests__categories-list">
                                {item.categorias.map(function (c, i) { return <li className="gestor-requests__categories-item" key={i}>{c}</li> })}
                            </ul>
                        </div>
                    )
                }

                let redesRender = null
                if (item.redes && Array.isArray(item.redes) && item.redes.length > 0) {
                    redesRender = (
                        <div className="gestor-requests__socials">
                            <strong>Redes:</strong>
                            <ul className="gestor-requests__socials-list">
                                {item.redes.map(function (r, i) { return <li className="gestor-requests__socials-item" key={i}>{r.tipo}: {r.link}</li> })}
                            </ul>
                        </div>
                    )
                }

                let timelineRender = null
                if (item.lineaTiempo && Array.isArray(item.lineaTiempo) && item.lineaTiempo.length > 0) {
                    const eventosNormalizados = normalizarLineaTiempo(item.lineaTiempo)
                    timelineRender = (
                        <div className="gestor-requests__timeline" style={{ marginTop: 12 }}>
                            <strong>Línea de tiempo:</strong>
                            <TimelineSwitcher eventos={eventosNormalizados} />
                        </div>
                    )
                }

                contenido = (
                    <div className="gestor-requests__card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p className="gestor-requests__field"><strong>ID Solicitud:</strong> {item.id}</p>
                        <p className="gestor-requests__field"><strong>Nombre POI:</strong> {item.nombre}</p>
                        <p className="gestor-requests__field"><strong>Descripción:</strong> {item.descripcion}</p>
                        {item.ubicacion && item.ubicacion.lat && item.ubicacion.lng && (
                            <p className="gestor-requests__field"><strong>Ubicación:</strong> {item.ubicacion.lat}, {item.ubicacion.lng}</p>
                        )}
                        {categoriasRender}
                        {redesRender}
                        {timelineRender}
                        {item.token && <p className="gestor-requests__field"><strong>ID Usuario (token):</strong> {item.token}</p>}

                        <div className="gestor-requests__actions" style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button className="gestor-requests__btn gestor-requests__btn--accept" onClick={function () { aceptarSolicitud(item) }}>Aceptar</button>
                            <button className="gestor-requests__btn gestor-requests__btn--deny" onClick={function () { negarSolicitud(item) }}>Negar</button>
                        </div>
                    </div>
                )
            } else {
                let redesRenderCuenta = null
                if (item.redes && Array.isArray(item.redes) && item.redes.length > 0) {
                    redesRenderCuenta = (
                        <div className="gestor-requests__socials">
                            <strong>Redes:</strong>
                            <ul className="gestor-requests__socials-list">
                                {item.redes.map(function (r, i) { return <li className="gestor-requests__socials-item" key={i}>{r.tipo}: {r.link}</li> })}
                            </ul>
                        </div>
                    )
                }

                contenido = (
                    <div className="gestor-requests__card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p className="gestor-requests__field"><strong>ID Usuario:</strong> {item.id}</p>
                        <p className="gestor-requests__field"><strong>Nombre:</strong> {item.nombre}</p>
                        <p className="gestor-requests__field"><strong>Provincia:</strong> {item.provinciaResidencia}</p>
                        {item.identificacion && <p className="gestor-requests__field"><strong>Identificación:</strong> {item.identificacion}</p>}
                        {item.correoSecundario && <p className="gestor-requests__field"><strong>Correo alterno:</strong> {item.correoSecundario}</p>}
                        {item.telefono && <p className="gestor-requests__field"><strong>Teléfono:</strong> {item.telefono}</p>}
                        {redesRenderCuenta}

                        <div className="gestor-requests__actions" style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button className="gestor-requests__btn gestor-requests__btn--accept" onClick={function () { aceptarSolicitud(item) }}>Aceptar</button>
                            <button className="gestor-requests__btn gestor-requests__btn--deny" onClick={function () { negarSolicitud(item) }}>Negar</button>
                        </div>
                    </div>
                )
            }

            return <div className="gestor-requests__item" key={index}>{contenido}</div>
        })

        listadoSolicitudes = <div className="gestor-requests__list">{itemsRenderizados}</div>
    }

    return (
        <div className="gestor-requests">
            <h2 className="gestor-requests__title">Solicitudes</h2>

            <div className="gestor-requests__filters" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button className="gestor-requests__filter-btn" onClick={function () { setFiltro("admin") }}>Ver solicitudes de Administrador</button>
                <button className="gestor-requests__filter-btn" onClick={function () { setFiltro("gestor") }}>Ver solicitudes de Gestor</button>
                <button className="gestor-requests__filter-btn" onClick={function () { setFiltro("poi") }}>Ver solicitudes de POIs</button>
            </div>

            {loading && <p className="gestor-requests__loading">Cargando solicitudes…</p>}
            {error && <p className="gestor-requests__error" style={{ color: "crimson" }}>{error}</p>}
            {!loading && mensaje && <p className="gestor-requests__message">{mensaje}</p>}

            {listadoSolicitudes}
        </div>
    )
}

export default GestorRequests
