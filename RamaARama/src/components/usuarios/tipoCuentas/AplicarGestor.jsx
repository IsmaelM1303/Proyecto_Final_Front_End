import React, { useState, useEffect } from 'react'
import { crearElemento, obtenerElementos } from '../../../api/Crud'

function AplicarGestor() {
    const provincias = [
        { id: 1, nombre: 'San José' },
        { id: 2, nombre: 'Alajuela' },
        { id: 3, nombre: 'Cartago' },
        { id: 4, nombre: 'Heredia' },
        { id: 5, nombre: 'Guanacaste' },
        { id: 6, nombre: 'Puntarenas' },
        { id: 7, nombre: 'Limón' }
    ]

    const opcionesRedes = [
        { id: 'facebook', nombre: 'Facebook' },
        { id: 'tiktok', nombre: 'TikTok' },
        { id: 'instagram', nombre: 'Instagram' },
        { id: 'web', nombre: 'Sitio Web' },
        { id: 'whatsapp', nombre: 'WhatsApp' }
    ]

    const [nombre, setNombre] = useState('')
    const [provinciaResidencia, setProvinciaResidencia] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [correoSecundario, setCorreoSecundario] = useState('')
    const [telefono, setTelefono] = useState('')
    const [redSocialSeleccionada, setRedSocialSeleccionada] = useState('')
    const [linkRed, setLinkRed] = useState('')
    const [redes, setRedes] = useState([])
    const [aceptaTerminos, setAceptaTerminos] = useState(false)

    // 🔹 Al montar, revisar si el usuario es admin y precargar datos
    useEffect(() => {
        async function cargarDatosUsuario() {
            const token = localStorage.getItem('token')
            if (!token) return

            const usuarios = await obtenerElementos('usuarios')
            if (!usuarios) return

            const usuario = usuarios.find(u => String(u.id) === String(token))
            if (!usuario) return

            // Si tipoCuenta contiene "admin"
            if (usuario.tipoCuenta?.toLowerCase().includes('admin')) {
                setNombre(usuario.nombre || '')
                setProvinciaResidencia(usuario.provinciaResidencia || '')
                setIdentificacion(usuario.identificacion || '')
                setCorreoSecundario(usuario.correoSecundario || '')
                setTelefono(usuario.telefono || '')
                setRedes(usuario.redes || [])
            }
        }

        cargarDatosUsuario()
    }, [])

    const agregarRed = () => {
        if (redSocialSeleccionada && linkRed) {
            setRedes([...redes, { tipo: redSocialSeleccionada, link: linkRed }])
            setRedSocialSeleccionada('')
            setLinkRed('')
        }
    }

    const eliminarRed = (index) => {
        setRedes(redes.filter((_, i) => i !== index))
    }

    const manejarEnvio = (e) => {
        e.preventDefault()
        if (!aceptaTerminos) {
            alert('Debe aceptar los términos y condiciones')
            return
        }

        if (window.confirm('¿Desea enviar la solicitud?')) {
            const datos = {
                id: localStorage.getItem('token'),
                nombre,
                provinciaResidencia,
                identificacion,
                correoSecundario,
                telefono,
                redes
            }

            crearElemento('requestGestores', datos)

            console.log('Datos enviados:', datos)

            // Limpiar formulario
            setNombre('')
            setProvinciaResidencia('')
            setIdentificacion('')
            setCorreoSecundario('')
            setTelefono('')
            setRedes([])
            setAceptaTerminos(false)
        }
    }

    return (
        <form onSubmit={manejarEnvio}>
            <h2>Aplicar para gestor turístico</h2>

            <div>
                <label>Nombre completo</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div>
                <label>Provincia de residencia</label>
                <select
                    value={provinciaResidencia}
                    onChange={(e) => setProvinciaResidencia(e.target.value)}
                >
                    <option value="" disabled>Eliga su provincia</option>
                    {provincias.map((prov) => (
                        <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Número de identificación</label>
                <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                />
            </div>

            <div>
                <label>Correo alternativo</label>
                <input
                    type="email"
                    value={correoSecundario}
                    onChange={(e) => setCorreoSecundario(e.target.value)}
                />
            </div>

            <div>
                <label>Número telefónico</label>
                <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>

            <div>
                <label>Redes sociales</label>
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

                <ul>
                    {redes.map((r, index) => (
                        <li key={index}>
                            {r.tipo}: {r.link}
                            <button type="button" onClick={() => eliminarRed(index)}>Quitar</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <span>Ver términos y condiciones</span>
                <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
            </div>

            <button type="submit">Aplicar</button>
        </form>
    )
}

export default AplicarGestor
