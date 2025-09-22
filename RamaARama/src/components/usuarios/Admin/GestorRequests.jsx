import { useState, useEffect } from 'react'
import { obtenerElementos, actualizarElemento, eliminarElemento } from '../../../api/Crud'
import emailjs from '@emailjs/browser'

function GestorRequests() {
    const [filtro, setFiltro] = useState('')
    const [datos, setDatos] = useState([])

    // Configuración EmailJS
    const serviceId = "RamaARama"
    const templateId = "template_9ymo2cf"
    const publicKey = "Mlos1g8OYYwn0hzqv"

    useEffect(() => {
        cargarDatos()
    }, [filtro])

    async function cargarDatos() {
        if (!filtro) {
            setDatos([])
            return
        }

        let endpoint = ''
        if (filtro === 'admin') endpoint = 'requestAdmins'
        if (filtro === 'gestor') endpoint = 'requestGestores'

        if (endpoint) {
            const resultado = await obtenerElementos(endpoint, 1)
            setDatos(resultado || [])
        }
    }

    async function obtenerCorreoUsuario(idUsuario) {
        const usuarios = await obtenerElementos('usuarios', 1)
        if (!usuarios) return null
        const usuario = usuarios.find(u => String(u.id) === String(idUsuario))
        return (usuario && usuario.correo) || null
    }

    async function obtenerNombreUsuarioActual() {
        const token = localStorage.getItem("token")
        if (!token) return null
        const usuarios = await obtenerElementos('usuarios', 1)
        if (!usuarios) return null
        const usuarioActual = usuarios.find(u => String(u.id) === String(token))
        return (usuarioActual && usuarioActual.nombre) || null
    }

    async function enviarCorreo({ name, toEmail, requestType, status, message }) {
        const params = {
            name,
            to_email: toEmail,
            request_type: requestType,
            status,
            time: new Date().toLocaleString(),
            message
        }

        try {
            await emailjs.send(serviceId, templateId, params, publicKey)
            console.log('Correo enviado a ' + toEmail)
        } catch (error) {
            console.error('Error al enviar correo:', error)
        }
    }

    async function aceptarSolicitud(item) {
        const nuevosDatos = { ...item }
        if (filtro === 'admin') nuevosDatos.tipoCuenta = 'turista admin'
        if (filtro === 'gestor') nuevosDatos.tipoCuenta = 'turista gestor'

        const actualizado = await actualizarElemento('usuarios', item.id, nuevosDatos, 1)
        if (actualizado) {
            const correoUsuario = await obtenerCorreoUsuario(item.id)
            const nombreAccion = await obtenerNombreUsuarioActual()

            if (correoUsuario) {
                let tipoSolicitud = 'Gestor'
                if (filtro === 'admin') tipoSolicitud = 'Administrador'

                await enviarCorreo({
                    name: item.nombre || 'Usuario',
                    toEmail: correoUsuario,
                    requestType: tipoSolicitud,
                    status: 'aprobada',
                    message: `Tu solicitud ha sido aprobada por ${nombreAccion || 'un miembro del equipo'}. Bienvenido/a al equipo.`
                })
            }

            let endpoint = 'requestGestores'
            if (filtro === 'admin') endpoint = 'requestAdmins'

            await eliminarElemento(endpoint, item.id, 1)
            setDatos(prev => prev.filter(req => req.id !== item.id))

            alert('Solicitud aceptada para usuario ' + item.id)
        } else {
            alert('Error al aceptar la solicitud')
        }
    }

    async function negarSolicitud(item) {
        const correoUsuario = await obtenerCorreoUsuario(item.id)
        const nombreAccion = await obtenerNombreUsuarioActual()

        if (correoUsuario) {
            let tipoSolicitud = 'Gestor'
            if (filtro === 'admin') tipoSolicitud = 'Administrador'

            await enviarCorreo({
                name: item.nombre || 'Usuario',
                toEmail: correoUsuario,
                requestType: tipoSolicitud,
                status: 'rechazada',
                message: `Tu solicitud ha sido rechazada por ${nombreAccion || 'un miembro del equipo'}. Gracias por tu interés.`
            })
        }

        let endpoint = 'requestGestores'
        if (filtro === 'admin') endpoint = 'requestAdmins'

        await eliminarElemento(endpoint, item.id, 1)
        setDatos(prev => prev.filter(req => req.id !== item.id))

        alert('Solicitud negada para usuario ' + item.id)
    }

    let mensaje = ''
    if (!filtro) {
        mensaje = 'Selecciona un filtro para ver solicitudes'
    }
    if (filtro && datos.length === 0) {
        mensaje = 'No hay solicitudes para este filtro'
    }

    return (
        <div>
            <h2>Solicitudes</h2>
            <div>
                <button onClick={() => setFiltro('admin')}>Ver solicitudes de Administrador</button>
                <button onClick={() => setFiltro('gestor')}>Ver solicitudes de Gestor</button>
            </div>

            <div>
                {mensaje && <p>{mensaje}</p>}
                {datos.length > 0 && datos.map((item, index) => (
                    <div key={index}>
                        <p><strong>ID Usuario:</strong> {item.id}</p>
                        <p><strong>Nombre:</strong> {item.nombre}</p>
                        <p><strong>Provincia:</strong> {item.provinciaResidencia}</p>
                        {item.identificacion && <p><strong>Identificación:</strong> {item.identificacion}</p>}
                        {item.correoSecundario && <p><strong>Correo alterno:</strong> {item.correoSecundario}</p>}
                        {item.telefono && <p><strong>Teléfono:</strong> {item.telefono}</p>}
                        {item.redes && item.redes.length > 0 && (
                            <div>
                                <strong>Redes:</strong>
                                <ul>
                                    {item.redes.map((r, i) => (
                                        <li key={i}>{r.tipo}: {r.link}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div>
                            <button onClick={() => aceptarSolicitud(item)}>Aceptar</button>
                            <button onClick={() => negarSolicitud(item)}>Negar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GestorRequests
