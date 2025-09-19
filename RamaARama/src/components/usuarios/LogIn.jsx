import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos } from "../../api/Crud"

function Alerta({ mostrar, onOcultar, mensaje }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (mostrar) {
            setVisible(true)
            const temporizador = setTimeout(() => {
                setVisible(false)
                if (onOcultar) {
                    onOcultar()
                }
            }, 3000)
            return () => clearTimeout(temporizador)
        }
    }, [mostrar, onOcultar])

    if (!visible) return null

    return <div>{mensaje}</div>
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

    const inputCorreo = (
        <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
        />
    )

    const inputContrasena = (
        <div>
            <input
                type={verContrasena ? "text" : "password"}
                placeholder="Contraseña"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
            />
            <button type="button" onClick={() => setVerContrasena(!verContrasena)}>
                {verContrasena ? "O" : "-"}
            </button>
        </div>
    )

    const botonLogin = <button type="submit">Iniciar sesión</button>

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <form onSubmit={manejoSubmit}>
                {inputCorreo}
                {inputContrasena}
                {botonLogin}
            </form>

            <p
                style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
                onClick={() => navigate("/Register")}
            >
                ¿No tienes cuenta? Regístrate aquí
            </p>

            <Alerta
                mostrar={mostrarAlerta}
                onOcultar={() => setMostrarAlerta(false)}
                mensaje={mensajeAlerta}
            />
        </div>
    )
}

export default Login
