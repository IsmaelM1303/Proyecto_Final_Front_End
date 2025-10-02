import React, { useState, useEffect } from 'react'
import { crearElemento, obtenerElementos } from '../../../api/Crud'
import "../../../styles/AplicarAdmin.css"

/**
 * Componente AplicarAdmin
 * Permite al usuario solicitar el rol de administrador turístico.
 * Incluye formulario con validación de cédula, subida de currículum PDF, y verificación de solicitud previa.
 * Los datos se guardan en la base simulada y se asocian al usuario autenticado.
 */
function AplicarAdmin() {
    // Lista de provincias para el selector
    const provincias = [
        { id: 1, nombre: 'San José' },
        { id: 2, nombre: 'Alajuela' },
        { id: 3, nombre: 'Cartago' },
        { id: 4, nombre: 'Heredia' },
        { id: 5, nombre: 'Guanacaste' },
        { id: 6, nombre: 'Puntarenas' },
        { id: 7, nombre: 'Limón' }
    ]

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('')
    const [provinciaResidencia, setProvinciaResidencia] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [correoSecundario, setCorreoSecundario] = useState('')
    const [telefono, setTelefono] = useState('')
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [curriculum, setCurriculum] = useState({})
    const [cedulaValida, setCedulaValida] = useState(false)

    // Carga datos del usuario si ya es admin
    useEffect(() => {
        async function cargarDatosUsuario() {
            const token = localStorage.getItem('token')
            if (!token) return

            const usuarios = await obtenerElementos('usuarios', 1)
            if (!usuarios) return

            const usuario = usuarios.find(u => String(u.id) === String(token))
            if (!usuario) return

            if (usuario.tipoCuenta && usuario.tipoCuenta.toLowerCase().includes('admin')) {
                if (usuario.nombre) setNombre(usuario.nombre)
                if (usuario.provinciaResidencia) setProvinciaResidencia(usuario.provinciaResidencia)
                if (usuario.identificacion) setIdentificacion(usuario.identificacion)
                if (usuario.correoSecundario) setCorreoSecundario(usuario.correoSecundario)
                if (usuario.telefono) setTelefono(usuario.telefono)
            }
        }
        cargarDatosUsuario()
    }, [])

    // Maneja la subida de archivo PDF y lo convierte a base64
    const manejarArchivo = (evento) => {
        const archivo = evento.target.files[0]
        if (archivo && archivo.type === "application/pdf") {
            const lector = new FileReader()
            lector.onloadend = () => {
                setCurriculum({
                    nombre: archivo.name,
                    tipo: archivo.type,
                    tamano: archivo.size,
                    contenido: lector.result.split(',')[1]
                })
            }
            lector.readAsDataURL(archivo)
        } else {
            alert("Por favor seleccione un archivo PDF válido")
        }
    }

    // Genera un ID aleatorio para el currículum
    const generarIdAleatorio = () => {
        return Math.random().toString(36).substring(2, 10) + Date.now()
    }

    // Verifica la cédula usando la API de Hacienda
    const verificarCedula = async (cedula) => {
        const cedulaNormalizada = cedula.replace(/\s+/g, '')
        if (cedulaNormalizada.length === 0) {
            setCedulaValida(false)
            return
        }
        try {
            const respuesta = await fetch(`https://api.hacienda.go.cr/fe/ae?identificacion=${cedulaNormalizada}`)
            const datos = await respuesta.json()
            if (datos && datos.nombre) {
                setCedulaValida(true)
                if (!nombre || nombre.trim().length === 0) {
                    setNombre(datos.nombre)
                }
            } else {
                setCedulaValida(false)
            }
        } catch (error) {
            setCedulaValida(false)
        }
    }

    // Maneja el cambio en el campo de identificación y verifica la cédula
    const manejarCambioIdentificacion = (evento) => {
        const valor = evento.target.value
        setIdentificacion(valor)
        verificarCedula(valor)
    }

    // Maneja el envío del formulario
    const manejarEnvio = async (evento) => {
        evento.preventDefault()

        if (!cedulaValida) {
            alert('Debe ingresar una cédula válida antes de continuar')
            return
        }
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

        const confirmarEnvio = window.confirm('¿Desea enviar la solicitud?')
        if (confirmarEnvio) {
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

            // Limpia el formulario
            setNombre('')
            setProvinciaResidencia('')
            setIdentificacion('')
            setCorreoSecundario('')
            setTelefono('')
            setCurriculum({})
            setAceptaTerminos(false)
            setCedulaValida(false)
        }
    }

    // Render principal del formulario de aplicación a admin
    return (
        <div className="aplicar-admin">
            <form className="aplicar-admin__form" onSubmit={manejarEnvio}>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Nombre completo</label>
                    <input
                        className="aplicar-admin__input"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Provincia de residencia</label>
                    <select
                        className="aplicar-admin__select"
                        value={provinciaResidencia}
                        onChange={(e) => setProvinciaResidencia(e.target.value)}
                    >
                        <option value="" disabled>Eliga su provincia</option>
                        {provincias.map(provincia => (
                            <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Número de identificación</label>
                    <input
                        className="aplicar-admin__input aplicar-admin__input--identificacion"
                        type="text"
                        value={identificacion}
                        onChange={manejarCambioIdentificacion}
                    />
                </div>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Correo alternativo</label>
                    <input
                        className="aplicar-admin__input"
                        type="email"
                        value={correoSecundario}
                        onChange={(e) => setCorreoSecundario(e.target.value)}
                    />
                </div>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Número telefónico</label>
                    <input
                        className="aplicar-admin__input"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                </div>
                <div className="aplicar-admin__field">
                    <label className="aplicar-admin__label">Subir currículum (PDF)</label>
                    <input
                        className="aplicar-admin__file"
                        type="file"
                        accept="application/pdf"
                        onChange={manejarArchivo}
                    />
                </div>
                <div className="aplicar-admin__field aplicar-admin__field--terms">
                    <span className="aplicar-admin__terms-text">Ver términos y condiciones</span>
                    <label className="aplicar-admin__checkbox">
                        <input
                            className="aplicar-admin__checkbox-input"
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                        />
                        <span className="aplicar-admin__checkbox-label">Acepto los términos</span>
                    </label>
                </div>
                <button
                    type="submit"
                    className="aplicar-admin__btn aplicar-admin__btn--submit"
                    disabled={!cedulaValida}
                >
                    Aplicar
                </button>
            </form>
        </div>
    )
}

export default AplicarAdmin