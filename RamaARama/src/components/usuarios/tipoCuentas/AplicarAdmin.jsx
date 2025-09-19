import React, { useState, useEffect } from 'react'
import { crearElemento, obtenerElementos } from '../../../api/Crud'

function AplicarAdmin() {
    const provincias = [
        { id: 1, nombre: 'San José' },
        { id: 2, nombre: 'Alajuela' },
        { id: 3, nombre: 'Cartago' },
        { id: 4, nombre: 'Heredia' },
        { id: 5, nombre: 'Guanacaste' },
        { id: 6, nombre: 'Puntarenas' },
        { id: 7, nombre: 'Limón' }
    ]

    const [nombre, setNombre] = useState('')
    const [provinciaResidencia, setProvinciaResidencia] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [correoSecundario, setCorreoSecundario] = useState('')
    const [telefono, setTelefono] = useState('')
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [curriculum, setCurriculum] = useState({})

    // Precargar datos si el usuario es admin
    useEffect(() => {
        async function cargarDatosUsuario() {
            const token = localStorage.getItem('token')
            if (!token) return

            const usuarios = await obtenerElementos('usuarios')
            if (!usuarios) return

            const usuario = usuarios.find(u => String(u.id) === String(token))
            if (!usuario) return

            if (usuario.tipoCuenta?.toLowerCase().includes('admin')) {
                setNombre(usuario.nombre || '')
                setProvinciaResidencia(usuario.provinciaResidencia || '')
                setIdentificacion(usuario.identificacion || '')
                setCorreoSecundario(usuario.correoSecundario || '')
                setTelefono(usuario.telefono || '')
            }
        }

        cargarDatosUsuario()
    }, [])

    // Manejar archivo PDF y convertirlo a Base64 con metadata
    const manejarArchivo = (e) => {
        const file = e.target.files[0]
        if (file && file.type === "application/pdf") {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCurriculum({
                    nombre: file.name,
                    tipo: file.type,
                    tamano: file.size,
                    contenido: reader.result.split(',')[1] // solo la parte Base64
                })
            }
            reader.readAsDataURL(file)
        } else {
            alert("Por favor seleccione un archivo PDF válido")
        }
    }

    const manejarEnvio = async (e) => {
        e.preventDefault()

        if (!aceptaTerminos) {
            alert('Debe aceptar los términos y condiciones')
            return
        }

        // Validar longitud de cédula
        if (identificacion.length < 9) {
            alert('El número de cédula es muy corto')
            return
        }
        const identificacionLetras = identificacion.toString()
        try {
            const resp = await fetch("https://apis.gometa.org/cedulas/" + identificacionLetras)
            const data = await resp.json()

            if (data.resultcount === 0) {
                alert('El número de cédula no es válido o no está registrado')
                return
            }

            if (data.resultcount === 1) {
                if (window.confirm('¿Desea enviar la solicitud?')) {
                    const datos = {
                        id: localStorage.getItem('token'),
                        nombre,
                        provinciaResidencia,
                        identificacion,
                        correoSecundario,
                        telefono,
                        curriculum
                    }

                    crearElemento('requestAdmins', datos)

                    console.log('Datos enviados:', datos)

                    // Limpiar formulario
                    setNombre('')
                    setProvinciaResidencia('')
                    setIdentificacion('')
                    setCorreoSecundario('')
                    setTelefono('')
                    setCurriculum({})
                    setAceptaTerminos(false)
                }
            }
        } catch (error) {
            console.error('Error validando cédula:', error)
            alert('Hubo un problema validando la cédula. Intente de nuevo.')
        }
    }

    return (
        <form onSubmit={manejarEnvio}>
            <h2>Aplicar para administrador</h2>

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
                <label>Subir currículum (PDF)</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={manejarArchivo}
                />
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

export default AplicarAdmin
