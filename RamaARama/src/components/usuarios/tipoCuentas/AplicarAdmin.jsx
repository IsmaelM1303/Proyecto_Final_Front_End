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

    useEffect(() => {
        async function cargarDatosUsuario() {
            const token = localStorage.getItem('token')
            if (!token) return

            const usuarios = await obtenerElementos('usuarios', 1)
            if (!usuarios) return

            const usuario = usuarios.find(u => String(u.id) === String(token))
            if (!usuario) return

            if (usuario.tipoCuenta && usuario.tipoCuenta.toLowerCase().includes('admin')) {
                setNombre(usuario.nombre || '')
                setProvinciaResidencia(usuario.provinciaResidencia || '')
                setIdentificacion(usuario.identificacion || '')
                setCorreoSecundario(usuario.correoSecundario || '')
                setTelefono(usuario.telefono || '')
            }
        }

        cargarDatosUsuario()
    }, [])

    const manejarArchivo = (e) => {
        const file = e.target.files[0]
        if (file && file.type === "application/pdf") {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCurriculum({
                    nombre: file.name,
                    tipo: file.type,
                    tamano: file.size,
                    contenido: reader.result.split(',')[1]
                })
            }
            reader.readAsDataURL(file)
        } else {
            alert("Por favor seleccione un archivo PDF válido")
        }
    }

    const generarIdAleatorio = () => {
        return Math.random().toString(36).substring(2, 10) + Date.now()
    }

    const manejarEnvio = async (e) => {
        e.preventDefault()

        if (!aceptaTerminos) {
            alert('Debe aceptar los términos y condiciones')
            return
        }

        if (!curriculum.contenido) {
            alert('Debe subir un currículum en PDF')
            return
        }

        const idUsuario = localStorage.getItem('token')

        const solicitudes = await obtenerElementos('requestAdmins', 1)
        if (solicitudes) {
            const existe = solicitudes.some(req => String(req.id) === String(idUsuario))
            if (existe) {
                alert('Ya existe una solicitud para este usuario')
                return
            }
        }

        if (window.confirm('¿Desea enviar la solicitud?')) {
            const idCurriculum = generarIdAleatorio()

            const datosCurriculum = {
                id: idCurriculum,
                idUsuario,
                curriculum: curriculum.contenido
            }

            const curriculumGuardado = await crearElemento('curricula', datosCurriculum, 2)
            if (!curriculumGuardado) {
                alert('Error al guardar el currículum')
                return
            }

            const curricula = await obtenerElementos('curricula', 2)
            const registroCurriculum = curricula.find(c => String(c.idUsuario) === String(idUsuario))
            if (!registroCurriculum) {
                alert('No se encontró el currículum recién guardado')
                return
            }

            const datosRequest = {
                id: idUsuario,
                nombre,
                provinciaResidencia,
                identificacion,
                correoSecundario,
                telefono,
                curriculum: registroCurriculum.id
            }

            await crearElemento('requestAdmins', datosRequest, 1)

            console.log('Currículum guardado en curricula:', datosCurriculum)
            console.log('Request creado en requestAdmins:', datosRequest)

            setNombre('')
            setProvinciaResidencia('')
            setIdentificacion('')
            setCorreoSecundario('')
            setTelefono('')
            setCurriculum({})
            setAceptaTerminos(false)
        }
    }

    return (
        <div>
            <form onSubmit={manejarEnvio}>
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
                        {provincias.map(prov => (
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
        </div>
    )
}

export default AplicarAdmin
