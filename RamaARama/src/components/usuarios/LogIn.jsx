import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../api/Crud"
import "../../styles/Login.css"

/**
 * Componente Alerta
 * Muestra un mensaje temporal en pantalla.
 * Se oculta automáticamente después de 3 segundos.
 */
function Alerta({ mostrar, onOcultar, mensaje }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (mostrar) {
            setVisible(true)
            const temporizador = setTimeout(() => {
                setVisible(false)
                if (onOcultar) onOcultar()
            }, 3000)
            return () => clearTimeout(temporizador)
        }
    }, [mostrar, onOcultar])

    if (!visible) return null

    return <div className="login-alerta">{mensaje}</div>
}

/**
 * Componente Login
 * Permite al usuario iniciar sesión con correo y contraseña.
 * Valida credenciales contra la base simulada y guarda el token en localStorage.
 * Muestra alertas de éxito o error y permite alternar la visibilidad de la contraseña.
 */
function Login() {
    const [correo, setCorreo] = useState("")
    const [contrasena, setContrasena] = useState("")
    const [mostrarAlerta, setMostrarAlerta] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState("")
    const [verContrasena, setVerContrasena] = useState(false)
    const navigate = useNavigate()

    // Maneja el envío del formulario de login
    async function manejoSubmit(e) {
        e.preventDefault()
        const usuarios = await obtenerElementos("usuarios")

        if (!usuarios) {
            setMensajeAlerta("Error al conectar con el servidor")
            setMostrarAlerta(true)
            return
        }

        // Busca usuario por correo y contraseña
        const usuarioEncontrado = usuarios.find(
            usuario => usuario.correo === correo && usuario.contrasena === contrasena
        )

        if (usuarioEncontrado) {
            localStorage.setItem("token", usuarioEncontrado.id)
            setMensajeAlerta("Inicio de sesión exitoso")
            setMostrarAlerta(true)
            setCorreo("")
            setContrasena("")
            navigate("/Main")
            return
        }

        setMensajeAlerta("Correo o contraseña incorrectos")
        setMostrarAlerta(true)
        setCorreo("")
        setContrasena("")
    }

    // Render principal del login
    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Iniciar sesión</h2>

                <form className="login-form" onSubmit={manejoSubmit}>
                    <input
                        className="login-input"
                        type="email"
                        placeholder="Correo"
                        value={correo}
                        onChange={e => setCorreo(e.target.value)}
                    />

                    <div className="login-password">
                        <input
                            className="login-input"
                            type={verContrasena ? "text" : "password"}
                            placeholder="Contraseña"
                            value={contrasena}
                            onChange={e => setContrasena(e.target.value)}
                        />
                        <button
                            type="button"
                            className="login-toggle-password"
                            onClick={() => setVerContrasena(!verContrasena)}
                        >
                            {verContrasena ? "O" : "-"}
                        </button>
                    </div>

                    <button type="submit" className="login-button">
                        Iniciar sesión
                    </button>
                </form>

                {/* Enlaces para registro y recuperación */}
                <p
                    className="login-link"
                    onClick={() => navigate("/Register")}
                >
                    ¿No tienes cuenta? Regístrate aquí
                </p>

                <p
                    className="login-link"
                    onClick={() => navigate("/RecuperarContrasena")}
                >
                    Olvidé mi contraseña
                </p>

                {/* Alerta de estado */}
                <Alerta
                    mostrar={mostrarAlerta}
                    onOcultar={() => setMostrarAlerta(false)}
                    mensaje={mensajeAlerta}
                />
            </div>
        </div>
    )
}

export default Login