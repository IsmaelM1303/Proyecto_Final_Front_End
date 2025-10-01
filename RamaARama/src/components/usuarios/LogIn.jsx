import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../api/Crud"
import "../../styles/Login.css"

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

function Login() {
    const [correo, setCorreo] = useState("")
    const [contrasena, setContrasena] = useState("")
    const [mostrarAlerta, setMostrarAlerta] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState("")
    const [verContrasena, setVerContrasena] = useState(false)
    const navigate = useNavigate()

    async function manejoSubmit(e) {
        e.preventDefault()
        const usuarios = await obtenerElementos("usuarios")

        if (!usuarios) {
            setMensajeAlerta("Error al conectar con el servidor")
            setMostrarAlerta(true)
            return
        }

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
