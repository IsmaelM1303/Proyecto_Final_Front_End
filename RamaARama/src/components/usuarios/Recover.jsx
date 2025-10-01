import React, { useState, useRef } from "react"
import emailjs from "@emailjs/browser"
import { obtenerElementos, actualizarElemento } from "../../api/Crud"
import "../../styles/Recover.css"

function Recover() {
    const [correo, setCorreo] = useState("")
    const [mensaje, setMensaje] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [correoValidado, setCorreoValidado] = useState(false)
    const [codigoIngresado, setCodigoIngresado] = useState("")
    const [codigoValidado, setCodigoValidado] = useState(false)
    const [nuevaContrasena, setNuevaContrasena] = useState("")
    const [confirmarContrasena, setConfirmarContrasena] = useState("")
    const [verContrasena, setVerContrasena] = useState(false)

    const codigoReferencia = useRef(null)
    const idUsuario = useRef(null)

    async function manejarEnvioCorreo(e) {
        e.preventDefault()

        if (!correo.trim()) {
            setMensaje("Por favor ingresa tu correo electrónico")
            return
        }

        setEnviando(true)
        setMensaje("")

        try {
            const usuarios = await obtenerElementos("usuarios", 1)

            if (!usuarios || !Array.isArray(usuarios)) {
                setMensaje("Error al conectar con el servidor")
                setEnviando(false)
                return
            }

            const usuarioEncontrado = usuarios.find((usuario) => usuario.correo === correo)

            if (!usuarioEncontrado) {
                setMensaje("El correo no está registrado")
                setEnviando(false)
                return
            }

            idUsuario.current = usuarioEncontrado.id

            const numeroRandom = Math.floor(100000 + Math.random() * 900000)
            codigoReferencia.current = numeroRandom

            const serviceId = "RamaARama"
            const templateId = "template_q3s6ubu"
            const publicKey = "Mlos1g8OYYwn0hzqv"

            const textoMensaje =
                "Recuperación de contraseña.\n\n" +
                "Si no solicitaste este correo, ignóralo y mantén tu cuenta segura.\n\n" +
                "Tu código de verificación es: " + numeroRandom

            const parametros = {
                to_email: correo,
                mensaje: textoMensaje
            }

            await emailjs.send(serviceId, templateId, parametros, publicKey)

            setMensaje("Se ha enviado un correo con el código de verificación")
            setCorreoValidado(true)
        } catch (error) {
            console.error("Error enviando correo de recuperación:", error)
            setMensaje("Ocurrió un error al enviar el correo. Intenta nuevamente.")
        } finally {
            setEnviando(false)
        }
    }

    function manejarValidacionCodigo() {
        if (String(codigoIngresado).trim() === String(codigoReferencia.current)) {
            setCodigoValidado(true)
            setMensaje("Código validado correctamente")
        } else {
            setMensaje("El código ingresado no es correcto")
        }
    }

    async function manejarCambioContrasena() {
        if (!nuevaContrasena.trim() || !confirmarContrasena.trim()) {
            setMensaje("Debes completar ambos campos de contraseña")
            return
        }

        if (nuevaContrasena !== confirmarContrasena) {
            setMensaje("Las contraseñas no coinciden")
            return
        }

        try {
            await actualizarElemento("usuarios", idUsuario.current, { contrasena: nuevaContrasena }, 1)
            setMensaje("La contraseña ha sido cambiada correctamente")
            setNuevaContrasena("")
            setConfirmarContrasena("")
        } catch (error) {
            console.error("Error actualizando contraseña:", error)
            setMensaje("Ocurrió un error al actualizar la contraseña")
        }
    }

    let textoBoton = enviando ? "Enviando..." : "Enviar correo de recuperación"

    return (
        <div className="divRecuperarCuenta">
            <h2 className="tituloRecuperar">Recuperar cuenta</h2>

            {!correoValidado && (
                <form className="formRecCorreo" onSubmit={manejarEnvioCorreo}>
                    <div className="campoRecCorreo">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo"
                            className="inputRecCorreo"
                        />
                    </div>

                    <div className="accionesRecCorreo">
                        <button type="submit" disabled={enviando} className="btnRecCorreo">
                            {textoBoton}
                        </button>
                    </div>
                </form>
            )}

            {correoValidado && !codigoValidado && (
                <div className="divRecCodigo">
                    <label>Ingresa el código recibido</label>
                    <input
                        type="text"
                        value={codigoIngresado}
                        onChange={(e) => setCodigoIngresado(e.target.value)}
                        placeholder="Código de verificación"
                        className="inputRecCodigo"
                    />
                    <div className="accionesRecCodigo">
                        <button type="button" onClick={manejarValidacionCodigo} className="btnRecCodigo">
                            Validar código
                        </button>
                    </div>
                </div>
            )}

            {codigoValidado && (
                <div className="divRecContrasena">
                    <label>Nueva contraseña</label>
                    <div className="campoRecContrasena">
                        <input
                            type={verContrasena ? "text" : "password"}
                            value={nuevaContrasena}
                            onChange={(e) => setNuevaContrasena(e.target.value)}
                            placeholder="Nueva contraseña"
                            className="inputRecContrasena"
                        />
                        <button
                            type="button"
                            onClick={() => setVerContrasena(!verContrasena)}
                            className="btnToggleRecContrasena"
                        >
                            {verContrasena ? "O" : "-"}
                        </button>
                    </div>

                    <label>Confirmar contraseña</label>
                    <input
                        type={verContrasena ? "text" : "password"}
                        value={confirmarContrasena}
                        onChange={(e) => setConfirmarContrasena(e.target.value)}
                        placeholder="Confirmar contraseña"
                        className="inputRecContrasena"
                    />

                    <div className="accionesRecContrasena">
                        <button type="button" onClick={manejarCambioContrasena} className="btnRecContrasena">
                            Cambiar contraseña
                        </button>
                    </div>
                </div>
            )}

            {mensaje && <p className="mensajeRecuperar">{mensaje}</p>}
        </div>
    )
}

export default Recover
