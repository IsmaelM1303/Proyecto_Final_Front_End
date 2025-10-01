import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { obtenerElementos, crearElemento } from "../../api/Crud"
import BtnVolver from "../general/BtnVolver"
import "../../styles/Register.css"

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

    return <div className="alertaRegister">{mensaje}</div>
}

function Register() {
    const [nombre, setNombre] = useState("")
    const [correo, setCorreo] = useState("")
    const [contrasena, setContrasena] = useState("")
    const [confirmarContrasena, setConfirmarContrasena] = useState("")
    const [mostrarAlerta, setMostrarAlerta] = useState(false)
    const [mensajeAlerta, setMensajeAlerta] = useState("")
    const [verContrasena, setVerContrasena] = useState(false)
    const [verConfirmar, setVerConfirmar] = useState(false)

    const navigate = useNavigate()

    async function manejoSubmit(e) {
        e.preventDefault()

        if (contrasena.length < 8) {
            setMensajeAlerta("La contraseña debe tener al menos 8 caracteres")
            setMostrarAlerta(true)
            return
        }

        if (contrasena !== confirmarContrasena) {
            setMensajeAlerta("Las contraseñas no coinciden")
            setMostrarAlerta(true)
            return
        }

        const usuarios = await obtenerElementos("usuarios")

        if (!usuarios) {
            setMensajeAlerta("Error al conectar con el servidor")
            setMostrarAlerta(true)
            return
        }

        const correoYaExiste = usuarios.some(usuario => usuario.correo === correo)

        if (correoYaExiste) {
            setMensajeAlerta("Ya existe un usuario con esa cuenta")
            setMostrarAlerta(true)
            return
        }

        const nuevoUsuario = {
            nombre,
            correo,
            contrasena,
            tipoCuenta: "turista"
        }

        const usuarioCreado = await crearElemento("usuarios", nuevoUsuario)

        if (!usuarioCreado) {
            setMensajeAlerta("Error al crear el usuario")
            setMostrarAlerta(true)
            return
        }

        localStorage.setItem("token", usuarioCreado.id)
        navigate("/Main")
    }

    return (
        <div className="divRegister">
            <h2 className="tituloRegister">Registrarse</h2>
            <form className="formRegister" onSubmit={manejoSubmit}>
                <input
                    className="inputRegister"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                />
                <input
                    className="inputRegister"
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                />
                <div className="campoContrasena">
                    <input
                        className="inputRegister"
                        type={verContrasena ? "text" : "password"}
                        placeholder="Contraseña"
                        value={contrasena}
                        onChange={e => setContrasena(e.target.value)}
                    />
                    <button
                        className="btnToggle"
                        type="button"
                        onClick={() => setVerContrasena(!verContrasena)}
                    >
                        {verContrasena ? "O" : "-"}
                    </button>
                </div>
                <div className="campoContrasena">
                    <input
                        className="inputRegister"
                        type={verConfirmar ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        value={confirmarContrasena}
                        onChange={e => setConfirmarContrasena(e.target.value)}
                    />
                    <button
                        className="btnToggle"
                        type="button"
                        onClick={() => setVerConfirmar(!verConfirmar)}
                    >
                        {verConfirmar ? "O" : "-"}
                    </button>
                </div>
                <button className="btnSubmitRegister" type="submit">Registrar</button>
            </form>
            <Alerta
                mostrar={mostrarAlerta}
                onOcultar={() => setMostrarAlerta(false)}
                mensaje={mensajeAlerta}
            />
            <BtnVolver />
        </div>
    )
}

export default Register
