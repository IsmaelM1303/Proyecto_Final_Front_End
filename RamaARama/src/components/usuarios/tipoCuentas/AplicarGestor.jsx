import { useState, useEffect } from 'react'
import { crearElemento, obtenerElementos } from '../../../api/Crud'
import "../../../styles/AplicarGestor.css"

/**
 * Componente AplicarGestor
 * Permite al usuario solicitar el rol de gestor turístico.
 * Incluye formulario con validación de cédula, campos de contacto y redes sociales.
 * Verifica si ya existe una solicitud previa y guarda los datos en la base simulada.
 */
function AplicarGestor() {
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

    // Opciones de redes sociales
    const opcionesRedes = [
        { id: 'facebook', nombre: 'Facebook' },
        { id: 'tiktok', nombre: 'TikTok' },
        { id: 'instagram', nombre: 'Instagram' },
        { id: 'web', nombre: 'Sitio Web' },
        { id: 'whatsapp', nombre: 'WhatsApp' }
    ]

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('')
    const [provinciaResidencia, setProvinciaResidencia] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [correoSecundario, setCorreoSecundario] = useState('')
    const [telefono, setTelefono] = useState('')
    const [redSocialSeleccionada, setRedSocialSeleccionada] = useState('')
    const [linkRed, setLinkRed] = useState('')
    const [redes, setRedes] = useState([])
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
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
                if (usuario.redes) setRedes(usuario.redes)
            }
        }
        cargarDatosUsuario()
    }, [])

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

    // Agrega una red social al arreglo
    const agregarRed = () => {
        if (redSocialSeleccionada && linkRed) {
            setRedes([...redes, { tipo: redSocialSeleccionada, link: linkRed }])
            setRedSocialSeleccionada('')
            setLinkRed('')
        }
    }

    // Elimina una red social del arreglo
    const eliminarRed = (index) => {
        setRedes(redes.filter((_, i) => i !== index))
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

        const idUsuario = localStorage.getItem('token')
        const solicitudes = await obtenerElementos('requestGestores', 1)
        if (solicitudes && solicitudes.some(req => String(req.id) === String(idUsuario))) {
            alert('Ya existe una solicitud para este usuario en requestGestores')
            return
        }

        const confirmarEnvio = window.confirm('¿Desea enviar la solicitud?')
        if (confirmarEnvio) {
            const datos = {
                id: idUsuario,
                nombre,
                provinciaResidencia,
                identificacion,
                correoSecundario,
                telefono,
                redes
            }
            await crearElemento('requestGestores', datos, 1)

            // Limpia el formulario
            setNombre('')
            setProvinciaResidencia('')
            setIdentificacion('')
            setCorreoSecundario('')
            setTelefono('')
            setRedes([])
            setAceptaTerminos(false)
            setCedulaValida(false)
        }
    }

    // Render principal del formulario de aplicación a gestor
    return (
        <form className="aplicar-gestor" onSubmit={manejarEnvio}>
            <h2 className="aplicar-gestor__title">Aplicar para gestor turístico</h2>
            <div className="aplicar-gestor__field">
                <label className="aplicar-gestor__label">Nombre completo</label>
                <input
                    className="aplicar-gestor__input"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>
            <div className="aplicar-gestor__field">
                <label className="aplicar-gestor__label">Provincia de residencia</label>
                <select
                    className="aplicar-gestor__select aplicar-gestor__select--provincia"
                    value={provinciaResidencia}
                    onChange={(e) => setProvinciaResidencia(e.target.value)}
                >
                    <option value="" disabled>Eliga su provincia</option>
                    {provincias.map(provincia => (
                        <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="aplicar-gestor__field">
                <label className="aplicar-gestor__label">Número de identificación</label>
                <input
                    className="aplicar-gestor__input aplicar-gestor__input--identificacion"
                    type="text"
                    value={identificacion}
                    onChange={manejarCambioIdentificacion}
                />
                <small className={`aplicar-gestor__hint ${cedulaValida ? 'is-valid' : 'is-invalid'}`}>
                    {cedulaValida ? 'Cédula verificada' : 'Ingrese una cédula válida para continuar'}
                </small>
            </div>
            <div className="aplicar-gestor__field">
                <label className="aplicar-gestor__label">Correo alternativo</label>
                <input
                    className="aplicar-gestor__input"
                    type="email"
                    value={correoSecundario}
                    onChange={(e) => setCorreoSecundario(e.target.value)}
                />
            </div>
            <div className="aplicar-gestor__field">
                <label className="aplicar-gestor__label">Número telefónico</label>
                <input
                    className="aplicar-gestor__input"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>
            <div className="aplicar-gestor__field aplicar-gestor__field--redes">
                <label className="aplicar-gestor__label">Redes sociales</label>
                <div className="aplicar-gestor__redes-inputs">
                    <select
                        className="aplicar-gestor__select aplicar-gestor__select--red"
                        value={redSocialSeleccionada}
                        onChange={(e) => setRedSocialSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione red social</option>
                        {opcionesRedes.map(red => (
                            <option key={red.id} value={red.nombre}>{red.nombre}</option>
                        ))}
                    </select>
                    <input
                        className="aplicar-gestor__input aplicar-gestor__input--url"
                        type="url"
                        placeholder="Link de la red social"
                        value={linkRed}
                        onChange={(e) => setLinkRed(e.target.value)}
                    />
                    <button
                        type="button"
                        className="aplicar-gestor__btn aplicar-gestor__btn--add"
                        onClick={agregarRed}
                    >
                        Agregar
                    </button>
                </div>
                <ul className="aplicar-gestor__redes-list">
                    {redes.map((r, index) => (
                        <li key={index} className="aplicar-gestor__redes-item">
                            <span className="aplicar-gestor__redes-label">{r.tipo}:</span> <span className="aplicar-gestor__redes-link">{r.link}</span>
                            <button
                                type="button"
                                className="aplicar-gestor__btn aplicar-gestor__btn--remove"
                                onClick={() => eliminarRed(index)}
                            >
                                Quitar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="aplicar-gestor__field aplicar-gestor__field--terms">
                <span className="aplicar-gestor__terms-text">Ver términos y condiciones</span>
                <label className="aplicar-gestor__checkbox">
                    <input
                        className="aplicar-gestor__checkbox-input"
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                    />
                    <span className="aplicar-gestor__checkbox-label">Acepto los términos</span>
                </label>
            </div>
            <button
                type="submit"
                className="aplicar-gestor__btn aplicar-gestor__btn--submit"
                disabled={!cedulaValida}
            >
                Aplicar
            </button>
        </form>
    )
}

export default AplicarGestor